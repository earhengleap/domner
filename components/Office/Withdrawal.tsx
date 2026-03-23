"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";

type WithdrawalStatus = "PENDING" | "APPROVED" | "REJECTED";

type WithdrawalItem = {
  id: string;
  amount: number;
  method: string;
  status: WithdrawalStatus;
  createdAt: string;
  updatedAt: string;
  processedBy?: string | null;
  user: {
    name?: string | null;
  };
};

interface WithdrawalPayload {
  pending: WithdrawalItem[];
  processed: WithdrawalItem[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const statusBadgeClass = (status: WithdrawalStatus) => {
  if (status === "APPROVED") return "bg-emerald-100 text-emerald-700";
  if (status === "REJECTED") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
};

export default function AdminWithdrawalDashboard() {
  const [pendingWithdrawals, setPendingWithdrawals] = useState<WithdrawalItem[]>([]);
  const [processedWithdrawals, setProcessedWithdrawals] = useState<WithdrawalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    void fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await fetch("/api/admin/withdrawals", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to fetch withdrawals");
      }
      const data: WithdrawalPayload = await response.json();
      setPendingWithdrawals(Array.isArray(data.pending) ? data.pending : []);
      setProcessedWithdrawals(Array.isArray(data.processed) ? data.processed : []);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleUpdateStatus = async (id: string, action: "approve" | "reject") => {
    try {
      setActionId(id);
      const response = await fetch("/api/admin/approve-withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawalId: id, action }),
      });

      if (response.ok) {
        await fetchWithdrawals(true);
      } else {
        console.error("Failed to update withdrawal status");
      }
    } catch (error) {
      console.error("Error updating withdrawal status:", error);
    } finally {
      setActionId(null);
    }
  };

  const pendingTotal = useMemo(
    () => pendingWithdrawals.reduce((sum, item) => sum + item.amount, 0),
    [pendingWithdrawals]
  );

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Withdrawal Management</h1>
            <p className="text-sm text-slate-500 mt-1">Review guide withdrawal requests and process payouts.</p>
          </div>

          <button
            type="button"
            onClick={() => void fetchWithdrawals(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Pending Requests</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{pendingWithdrawals.length.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Pending Amount</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{formatCurrency(pendingTotal)}</p>
          </div>
        </div>
      </section>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Pending Withdrawals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guide</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingWithdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell className="font-medium">{withdrawal.user?.name || "Unknown"}</TableCell>
                  <TableCell>{withdrawal.method}</TableCell>
                  <TableCell>{formatCurrency(withdrawal.amount)}</TableCell>
                  <TableCell suppressHydrationWarning>{formatDate(withdrawal.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        onClick={() => void handleUpdateStatus(withdrawal.id, "approve")}
                        disabled={actionId === withdrawal.id}
                        className="h-8"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => void handleUpdateStatus(withdrawal.id, "reject")}
                        disabled={actionId === withdrawal.id}
                        variant="destructive"
                        className="h-8"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {pendingWithdrawals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                    No pending withdrawals.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Processed Withdrawals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guide</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Processed</TableHead>
                <TableHead>Processed By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedWithdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell className="font-medium">{withdrawal.user?.name || "Unknown"}</TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(withdrawal.status)}`}>
                      {withdrawal.status}
                    </span>
                  </TableCell>
                  <TableCell>{withdrawal.method}</TableCell>
                  <TableCell>{formatCurrency(withdrawal.amount)}</TableCell>
                  <TableCell suppressHydrationWarning>{formatDate(withdrawal.updatedAt)}</TableCell>
                  <TableCell className="text-slate-600">{withdrawal.processedBy || "System"}</TableCell>
                </TableRow>
              ))}

              {processedWithdrawals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                    No processed withdrawals yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
