import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Users, Plus, Trash2, CheckCircle, Clock, AlertCircle, ShieldAlert, Link as LinkIcon } from "lucide-react";
import { Link } from "wouter";

type ApprovedClient = {
  id: string;
  email: string;
  addedAt: string;
  usedAt: string | null;
};

export default function AdminClients() {
  const [newEmail, setNewEmail] = useState("");
  const [formError, setFormError] = useState("");

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
    onError: (err: any) => {
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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed) {
      setFormError("Please enter an email address");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setFormError("Please enter a valid email address");
      return;
    }
    addMutation.mutate(trimmed);
  };

  const isAccessDenied =
    (error as any)?.message?.includes("Forbidden") ||
    (error as any)?.message?.includes("Admin access required");

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
