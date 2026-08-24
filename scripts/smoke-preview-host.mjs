#!/usr/bin/env node

import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { request } from "node:http";
import { createServer } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const previewHost =
  process.env.PREVIEW_SMOKE_HOST || "preview-smoke.replit.dev";
const startupTimeoutMs = 30_000;
const requestTimeoutMs = 5_000;
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const tsxCliPath = path.resolve(
  scriptDirectory,
  "../node_modules/tsx/dist/cli.mjs",
);

function requestAppShell(port) {
  return new Promise((resolve, reject) => {
    const req = request(
      {
        hostname: "127.0.0.1",
        port,
        path: "/",
        method: "GET",
        headers: { Host: previewHost },
      },
      (res) => {
        let body = "";

        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () =>
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body,
          }),
        );
      },
    );

    req.setTimeout(requestTimeoutMs, () => {
      req.destroy(new Error(`request timed out after ${requestTimeoutMs}ms`));
    });
    req.on("error", reject);
    req.end();
  });
}

function waitForExit(child) {
  return new Promise((resolve) => child.once("exit", resolve));
}

function reservePort() {
  return new Promise((resolve, reject) => {
    const reservation = createServer();

    reservation.once("error", reject);
    reservation.listen(0, "127.0.0.1", () => {
      const address = reservation.address();
      if (!address || typeof address === "string") {
        reservation.close();
        reject(new Error("could not reserve an isolated port"));
        return;
      }

      reservation.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(address.port);
      });
    });
  });
}

async function stopServer(server) {
  if (server.exitCode !== null) {
    return;
  }

  server.kill("SIGTERM");

  await Promise.race([
    waitForExit(server),
    new Promise((resolve) => setTimeout(resolve, 2_000)),
  ]);

  if (server.exitCode === null) {
    server.kill("SIGKILL");
    await waitForExit(server);
  }
}

async function main() {
  // Do not require or pass production credentials to this check. The server
  // only needs a database URL while loading its modules; the shell request
  // does not access the database or any authenticated route.
  const childEnv = { ...process.env };
  for (const key of [
    "DATABASE_URL",
    "NEON_DATABASE_URL",
    "SESSION_SECRET",
    "ADMIN_EMAIL",
    "GITHUB_TOKEN",
  ]) {
    delete childEnv[key];
  }
  childEnv.NODE_ENV = "development";
  childEnv.DATABASE_URL = "postgresql://preview-smoke.invalid/preview-smoke";
  childEnv.SESSION_SECRET = "preview-smoke-session";
  const smokeToken = randomUUID();
  childEnv.PREVIEW_SMOKE_TOKEN = smokeToken;
  const port = await reservePort();
  childEnv.PORT = String(port);

  const server = spawn(
    process.execPath,
    [tsxCliPath, "--tsconfig", "tsconfig.server.json", "server/index.ts"],
    {
      env: childEnv,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let serverOutput = "";
  let serverReady = false;
  let spawnError;
  const recordOutput = (chunk) => {
    serverOutput += chunk;
    serverReady ||= serverOutput.includes(
      `Server running on http://0.0.0.0:${port} (development)`,
    );
  };
  server.stdout.on("data", recordOutput);
  server.stderr.on("data", recordOutput);
  server.once("error", (error) => {
    spawnError = error;
  });

  const deadline = Date.now() + startupTimeoutMs;
  try {
    while (!serverReady) {
      if (spawnError) {
        throw new Error(`could not start the development server: ${spawnError.message}`);
      }
      if (server.exitCode !== null) {
        throw new Error(
          `development server exited before serving preview (${server.exitCode}).\n${serverOutput}`,
        );
      }
      if (Date.now() >= deadline) {
        throw new Error(
          `development server did not start on port ${port} within ${startupTimeoutMs}ms.\n${serverOutput}`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    const result = await requestAppShell(port);
    if (spawnError || server.exitCode !== null) {
      throw new Error(
        `development server exited before the preview host could be validated.\n${serverOutput}`,
      );
    }

    if (result.headers["x-preview-smoke-token"] !== smokeToken) {
      throw new Error(
        "the response did not come from the development server started by this check.",
      );
    }

    if (result.statusCode !== 200) {
      throw new Error(
        `preview host "${previewHost}" was rejected (HTTP ${result.statusCode ?? "unknown"}). ` +
          "Vite must allow representative *.replit.dev hosts.",
      );
    }

    if (
      !result.body.includes('<div id="root"></div>') ||
      !result.body.includes('<script type="module" src="/client/src/main.tsx">')
    ) {
      throw new Error(
        `preview host "${previewHost}" returned HTTP 200 but not the app shell.`,
      );
    }

    console.log(
      `Preview host smoke check passed: ${previewHost} returned the app shell.`,
    );
  } finally {
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error(`Preview host smoke check failed: ${error.message}`);
  process.exitCode = 1;
});