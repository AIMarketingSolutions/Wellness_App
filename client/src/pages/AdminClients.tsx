import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Users, Plus, Trash2, CheckCircle, Clock, AlertCircle, ShieldAlert, Link as LinkIcon, Upload, FileText, X } from "lucide-react";
import { Link } from "wouter";

type ApprovedClient = {
  id: string;
  email: string;
  addedAt: string;
  usedAt: string | null;
};

type BulkResult = {
  added: number;
  skipped: number;
};

function parseEmailsFromText(text: string): string[] {
  return text
    .split(/[\n,;]+/)
    .map((line) => line.trim().toLowerCase())
    .filter((line) => line.length > 0);
}

export default function AdminClients() {
  const [newEmail, setNewEmail] = useState("");
  const [formError, setFormError] = useState("");

  const [bulkText, setBulkText] = useState("");
  const [parsedEmails, setParsedEmails] = useState<string[]>([]);
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);
  const [bulkError, setBulkError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const { data: clients = [], isLoading, error } = useQuery<ApprovedClient[]>({
    queryKey: ["/api/admin/approved-clients"],
  });

  const addMutation = useMutation({
    mutationFn: (email: string) =>
      apiRequest("/api/admin/approved-clients", { method: "POST", body: JSON.stringify({ email }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/approved-clients"] });
      setNewEmail("");
      setFormError("");
    },
    onError: (err: Error) => {
      setFormError(err.message || "Failed to add email");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (email: string) =>
      apiRequest(`/api/admin/approved-clients/${encodeURIComponent(email)}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/approved-clients"] });
    },
  });

  const bulkMutation = useMutation({
    mutationFn: (emails: string[]) =>
      apiRequest("/api/admin/approved-clients/bulk", {
        method: "POST",
        body: JSON.stringify({ emails }),
      }),
    onSuccess: (data: BulkResult) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/approved-clients"] });
      setBulkResult(data);
      setBulkText("");
      setParsedEmails([]);
      setShowPreview(false);
      setBulkError("");
    },
    onError: (err: Error) => {
      setBulkError(err.message || "Bulk upload failed");
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed) {
      setFormError("Please enter an email address");
      return;
    }
    if (!emailRegex.test(trimmed)) {
      setFormError("Please enter a valid email address");
      return;
    }
    addMutation.mutate(trimmed);
  };

  const handleBulkTextChange = (value: string) => {
    setBulkText(value);
    setBulkResult(null);
    setBulkError("");
    const emails = parseEmailsFromText(value).filter((e) => emailRegex.test(e));
    setParsedEmails(emails);
    setShowPreview(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      handleBulkTextChange(text);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handlePreview = () => {
    setBulkError("");
    if (parsedEmails.length === 0) {
      setBulkError("No valid email addresses found. Each line should contain one email address.");
      return;
    }
    setShowPreview(true);
  };

  const handleBulkSubmit = () => {
    bulkMutation.mutate(parsedEmails);
  };

  const handleClearBulk = () => {
    setBulkText("");
    setParsedEmails([]);
    setShowPreview(false);
    setBulkResult(null);
    setBulkError("");
  };

  const errorMessage = error instanceof Error ? error.message : "";
  const isAccessDenied =
    errorMessage.includes("Forbidden") ||
    errorMessage.includes("Admin access required");

  const pending = clients.filter((c) => !c.usedAt);
  const used = clients.filter((c) => c.usedAt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6DD891]/5 via-[#4A90E2]/5 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="backdrop-blur-sm bg-white/90 border border-[#6DD891]/20 rounded-2xl shadow-lg">
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-[#6DD891] to-[#4A90E2] p-3 rounded-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#2C3E50]">Approved Clients</h1>
                <p className="text-gray-600 mt-1">
                  Manage which email addresses are allowed to sign up
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Access denied */}
            {isAccessDenied && (
              <div className="rounded-xl p-5 border border-orange-200 bg-orange-50 flex items-start gap-3">
                <ShieldAlert className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-900">Access Denied</p>
                  <p className="text-sm text-orange-800 mt-1">
                    This page is for administrators only.
                  </p>
                </div>
              </div>
            )}

            {/* Add new email form */}
            {!isAccessDenied && (
              <form onSubmit={handleAdd} className="space-y-3" data-testid="form-add-client">
                <label className="block text-sm font-semibold text-[#2C3E50]">
                  Add a new approved email
                </label>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="client@example.com"
                    disabled={addMutation.isPending}
                    data-testid="input-new-email"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#52C878]/20 focus:border-[#52C878] transition-all text-gray-800 placeholder-gray-400 bg-white/50"
                  />
                  <button
                    type="submit"
                    disabled={addMutation.isPending}
                    data-testid="button-add-client"
                    className="px-5 py-3 bg-gradient-to-r from-[#52C878] to-[#4A90E2] hover:from-[#52C878]/90 hover:to-[#4A90E2]/90 text-white font-semibold rounded-xl shadow hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                    {addMutation.isPending ? "Adding..." : "Add"}
                  </button>
                </div>
                {formError && (
                  <div className="flex items-center gap-2 text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {formError}
                  </div>
                )}
              </form>
            )}

            {/* Stats */}
            {!isAccessDenied && !isLoading && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-blue-700">{pending.length}</p>
                  <p className="text-sm text-blue-600 mt-1">Pending (not yet signed up)</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-green-700">{used.length}</p>
                  <p className="text-sm text-green-600 mt-1">Active (account created)</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bulk Upload */}
        {!isAccessDenied && (
          <div className="backdrop-blur-sm bg-white/90 border border-[#6DD891]/20 rounded-2xl shadow-lg">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-[#6DD891]/20 to-[#4A90E2]/20 p-2 rounded-lg">
                  <Upload className="h-5 w-5 text-[#4A90E2]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#2C3E50]">Bulk Upload</h2>
                  <p className="text-sm text-gray-500">Approve multiple clients at once</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Success result banner */}
              {bulkResult && (
                <div className="rounded-xl p-4 border border-green-200 bg-green-50 flex items-start gap-3" data-testid="bulk-result">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900">Upload complete</p>
                    <p className="text-sm text-green-800 mt-0.5" data-testid="text-bulk-summary">
                      {bulkResult.added} added
                      {bulkResult.skipped > 0 ? `, ${bulkResult.skipped} skipped (already approved)` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => setBulkResult(null)}
                    className="ml-auto text-green-600 hover:text-green-800"
                    data-testid="button-dismiss-result"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Textarea */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#2C3E50]">
                  Paste emails (one per line, or comma/semicolon separated)
                </label>
                <textarea
                  value={bulkText}
                  onChange={(e) => handleBulkTextChange(e.target.value)}
                  placeholder={"alice@example.com\nbob@example.com\ncarol@example.com"}
                  rows={5}
                  data-testid="textarea-bulk-emails"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#52C878]/20 focus:border-[#52C878] transition-all text-gray-800 placeholder-gray-400 bg-white/50 font-mono text-sm resize-y"
                />
                {parsedEmails.length > 0 && (
                  <p className="text-xs text-gray-500" data-testid="text-parsed-count">
                    {parsedEmails.length} valid email{parsedEmails.length !== 1 ? "s" : ""} detected
                  </p>
                )}
              </div>

              {/* File upload */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-upload-csv"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[#52C878] hover:text-[#52C878] transition-all"
                >
                  <FileText className="h-4 w-4" />
                  Upload CSV file
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  data-testid="input-csv-file"
                />
                {bulkText && (
                  <button
                    type="button"
                    onClick={handleClearBulk}
                    data-testid="button-clear-bulk"
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear
                  </button>
                )}
              </div>

              {/* Error */}
              {bulkError && (
                <div className="flex items-center gap-2 text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2" data-testid="bulk-error">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {bulkError}
                </div>
              )}

              {/* Preview */}
              {showPreview && parsedEmails.length > 0 && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3" data-testid="bulk-preview">
                  <p className="text-sm font-semibold text-blue-900">
                    Preview — {parsedEmails.length} valid email{parsedEmails.length !== 1 ? "s" : ""} ready to submit (duplicates will be skipped automatically):
                  </p>
                  <ul className="max-h-48 overflow-y-auto space-y-1">
                    {parsedEmails.map((email, idx) => (
                      <li key={idx} className="text-sm font-mono text-blue-800" data-testid={`preview-email-${idx}`}>
                        {email}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {!showPreview ? (
                  <button
                    type="button"
                    onClick={handlePreview}
                    disabled={parsedEmails.length === 0}
                    data-testid="button-preview-bulk"
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Preview ({parsedEmails.length})
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleBulkSubmit}
                    disabled={bulkMutation.isPending}
                    data-testid="button-submit-bulk"
                    className="px-5 py-2.5 bg-gradient-to-r from-[#52C878] to-[#4A90E2] hover:from-[#52C878]/90 hover:to-[#4A90E2]/90 text-white font-semibold rounded-xl shadow hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="h-4 w-4" />
                    {bulkMutation.isPending ? "Uploading..." : `Approve ${parsedEmails.length} emails`}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Client list */}
        {!isAccessDenied && (
          <div className="backdrop-blur-sm bg-white/90 border border-[#6DD891]/20 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#2C3E50]">
                All Approved Emails ({clients.length})
              </h2>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#52C878] mx-auto mb-3" />
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : clients.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No approved emails yet</p>
                <p className="text-sm mt-1">Add client emails above to allow them to sign up.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    data-testid={`row-client-${client.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {client.usedAt ? (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <Clock className="h-5 w-5 text-blue-400 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p
                          className="font-medium text-[#2C3E50] truncate"
                          data-testid={`text-email-${client.id}`}
                        >
                          {client.email}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {client.usedAt
                            ? `Account created ${new Date(client.usedAt).toLocaleDateString()}`
                            : `Added ${new Date(client.addedAt).toLocaleDateString()} · Pending signup`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeMutation.mutate(client.email)}
                      disabled={removeMutation.isPending}
                      data-testid={`button-remove-${client.id}`}
                      className="ml-4 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                      title="Remove from approved list"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Back to admin */}
        <div className="text-center">
          <Link
            href="/admin-seed"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#52C878] transition-colors"
            data-testid="link-admin-seed"
          >
            <LinkIcon className="h-4 w-4" />
            Back to Database Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
