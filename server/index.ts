import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import { createServer as createViteServer } from "vite";
import routes from "./routes";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import connectPgSimple from "connect-pg-simple";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const rawPort = process.env.PORT;
if (rawPort && !/^\d+$/.test(rawPort)) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}
const PORT = rawPort ? Number(rawPort) : 5000;
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}
const previewSmokeToken = process.env.PREVIEW_SMOKE_TOKEN;
const isProduction = process.env.NODE_ENV === "production";

app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  if (previewSmokeToken) {
    res.setHeader("X-Preview-Smoke-Token", previewSmokeToken);
  }
  next();
});

const PgSession = connectPgSimple(session);

app.use(
  session({
    store: isProduction
      ? new PgSession({
          pool: new pg.Pool({ connectionString: process.env.DATABASE_URL }),
          tableName: "user_sessions",
          createTableIfMissing: true,
        })
      : undefined,
    secret: process.env.SESSION_SECRET || "wellness-app-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction, // Use secure cookies in production (HTTPS)
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax', // Allow cookies in cross-site contexts
    },
  })
);

app.use(routes);

async function startServer() {
  if (isProduction) {
    // In production, serve the built static files
    const distPath = path.join(__dirname, "..", "dist");
    app.use(express.static(distPath));
    
    // Serve index.html for all other routes (SPA fallback)
    // Use a regex pattern instead of '*' for compatibility with path-to-regexp
    app.get(/^\/(?!api).*/, (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    // In development, use Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
