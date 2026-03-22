"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CreditCard,
  Download,
  Landmark,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type StatusState =
  | {
      type: "success" | "error";
      message: string;
    }
  | null;

type FinanceHistoryPoint = {
  date: string;
  balance: number;
  type: "CREDIT" | "DEBIT";
  description: string;
};

type MonthlyEarning = {
  month: string;
  earnings: number;
};

type CardInfo = {
  id: string;
  last4: string;
  expirationDate?: string;
} | null;

type PendingWithdrawal = {
  id: string;
  amount: number;
  createdAt: string;
  method: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);
}

function formatShortDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(parsed);
}

function formatMonthLabel(value: string) {
  const parsed = new Date(`${value}-01T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export default function GuideFincanceDashboard() {
  const [balance, setBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [balanceHistory, setBalanceHistory] = useState<FinanceHistoryPoint[]>([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarning[]>([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [totalDebits, setTotalDebits] = useState(0);
  const [status, setStatus] = useState<StatusState>(null);
  const [card, setCard] = useState<CardInfo>(null);
  const [newCard, setNewCard] = useState({ number: "", expiry: "", cvv: "" });
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<PendingWithdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<"withdraw" | "card" | "remove-card" | null>(null);

  useEffect(() => {
    void loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);

    try {
      await Promise.all([fetchBalanceData(), fetchCard(), fetchPendingWithdrawals()]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBalanceData = async () => {
    try {
      const response = await fetch("/api/guide/finance");

      if (!response.ok) {
        throw new Error("Failed to fetch balance data.");
      }

      const data = await response.json();
      setBalance(data.balance || 0);
      setBalanceHistory(data.history || []);
      setMonthlyEarnings(data.monthlyEarnings || []);
      setTotalCredits(data.totalCredits || 0);
      setTotalDebits(data.totalDebits || 0);
    } catch (error) {
      console.error("Failed to fetch balance data:", error);
      setStatus({ type: "error", message: "Failed to fetch finance dashboard data." });
    }
  };

  const fetchCard = async () => {
    try {
      const response = await fetch("/api/guide/cards");

      if (!response.ok) {
        throw new Error("Failed to fetch payout card.");
      }

      const data = await response.json();
      setCard(data.card);
    } catch (error) {
      console.error("Failed to fetch card:", error);
      setStatus({ type: "error", message: "Failed to fetch payout card information." });
    }
  };

  const fetchPendingWithdrawals = async () => {
    try {
      const response = await fetch("/api/guide/pending-withdrawals");

      if (!response.ok) {
        throw new Error("Failed to fetch pending withdrawals.");
      }

      const data = await response.json();
      setPendingWithdrawals(data.withdrawals || []);
    } catch (error) {
      console.error("Failed to fetch pending withdrawals:", error);
      setStatus({ type: "error", message: "Failed to fetch pending withdrawals." });
    }
  };

  const handleWithdrawalRequest = async () => {
    if (!card) {
      setStatus({
        type: "error",
        message: "Add a payout card before requesting a withdrawal.",
      });
      return;
    }

    const amount = Number(withdrawAmount);

    if (!amount || amount <= 0) {
      setStatus({
        type: "error",
        message: "Enter a valid withdrawal amount.",
      });
      return;
    }

    try {
      setBusyAction("withdraw");

      const response = await fetch("/api/guide/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          method: "BANK_TRANSFER",
          methodDetails: { cardId: card.id },
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit withdrawal request.");
      }

      setWithdrawAmount("");
      setStatus({
        type: "success",
        message: "Withdrawal request submitted. It is now waiting for admin approval.",
      });
      await Promise.all([fetchPendingWithdrawals(), fetchBalanceData()]);
    } catch (error) {
      console.error("Error submitting withdrawal request:", error);
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "An error occurred while submitting the withdrawal request.",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleAddCard = async () => {
    try {
      setBusyAction("card");

      const response = await fetch("/api/guide/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCard),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to add payout card.");
      }

      setCard(data.card);
      setNewCard({ number: "", expiry: "", cvv: "" });
      setIsAddingCard(false);
      setStatus({ type: "success", message: "Payout card added successfully." });
    } catch (error) {
      console.error("Error adding card:", error);
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "An error occurred while adding the card.",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleRemoveCard = async () => {
    try {
      setBusyAction("remove-card");

      const response = await fetch("/api/guide/cards", {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove payout card.");
      }

      setCard(null);
      setStatus({ type: "success", message: "Payout card removed successfully." });
    } catch (error) {
      console.error("Error removing card:", error);
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "An error occurred while removing the card.",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleExportFinancialData = async () => {
    try {
      const response = await fetch("/api/guide/export-finance");

      if (!response.ok) {
        throw new Error("Failed to export financial data.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.download = "financial_report.csv";
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export financial data:", error);
      setStatus({ type: "error", message: "Failed to export financial data." });
    }
  };

  const latestMonth = monthlyEarnings.at(-1)?.earnings ?? 0;
  const previousMonth = monthlyEarnings.at(-2)?.earnings ?? 0;
  const monthDelta = latestMonth - previousMonth;
  const nextPayoutTotal = pendingWithdrawals.reduce((sum, item) => sum + item.amount, 0);

  const chartHistory = useMemo(
    () =>
      [...balanceHistory]
        .reverse()
        .map((entry) => ({
          ...entry,
          dateLabel: formatShortDate(entry.date),
        })),
    [balanceHistory]
  );

  const monthlyChartData = useMemo(
    () =>
      monthlyEarnings.map((entry) => ({
        ...entry,
        monthLabel: formatMonthLabel(entry.month),
      })),
    [monthlyEarnings]
  );

  return (
    <div className="w-full space-y-8">
      <section className="rounded-[2rem] border border-[#eadfd6] bg-[linear-gradient(135deg,_#fff9f4_0%,_#ffffff_48%,_#f2faf6_100%)] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-4">
            <div className="inline-flex rounded-full bg-[#f3e7db] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-[#A18167]">
              Guide Finance
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#2f251d] sm:text-4xl">
                Finance dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Track available balance, payout requests, and recent transaction flow from a cleaner professional workspace.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleExportFinancialData}
              variant="outline"
              className="rounded-full border-[#d7c0af] bg-white text-[#2f251d] hover:bg-[#f9f1ea]"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              onClick={loadDashboard}
              variant="outline"
              className="rounded-full border-[#d7c0af] bg-white text-[#2f251d] hover:bg-[#f9f1ea]"
            >
              Refresh
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-[#eadfd6] bg-white/90 shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Available balance</p>
                  <p className="mt-2 text-3xl font-semibold text-[#2f251d]">
                    {formatCurrency(balance)}
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                  <Wallet className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#eadfd6] bg-white/90 shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Incoming credits</p>
                  <p className="mt-2 text-3xl font-semibold text-[#2f251d]">
                    {formatCurrency(totalCredits)}
                  </p>
                </div>
                <div className="rounded-2xl bg-sky-50 p-3 text-sky-700">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#eadfd6] bg-white/90 shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Outgoing debits</p>
                  <p className="mt-2 text-3xl font-semibold text-[#2f251d]">
                    {formatCurrency(totalDebits)}
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                  <TrendingDown className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#eadfd6] bg-white/90 shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Pending payout total</p>
                  <p className="mt-2 text-3xl font-semibold text-[#2f251d]">
                    {formatCurrency(nextPayoutTotal)}
                  </p>
                </div>
                <div className="rounded-2xl bg-rose-50 p-3 text-rose-700">
                  <Landmark className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <Card className="border-[#eadfd6] shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-[#2f251d]">Payout setup</CardTitle>
            <CardDescription>
              Manage the payout card connected to your withdrawal requests.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {card ? (
              <div className="flex flex-col gap-4 rounded-3xl border border-[#eadfd6] bg-[#fffaf6] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-white p-3 text-[#A18167] shadow-sm">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Active payout card</p>
                    <p className="mt-1 text-lg font-semibold text-[#2f251d]">
                      **** {card.last4}
                    </p>
                    <p className="text-sm text-slate-500">
                      {card.expirationDate ? `Expires ${card.expirationDate}` : "Ready for payouts"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleRemoveCard}
                  disabled={busyAction === "remove-card"}
                  className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove card
                </Button>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#d7c0af] bg-[#fffaf6] p-6">
                <p className="text-sm text-slate-600">
                  No payout card is connected yet. Add one to enable withdrawal requests.
                </p>
                <Button
                  onClick={() => setIsAddingCard(true)}
                  className="mt-4 rounded-full bg-[#2f251d] text-white hover:bg-[#1f1812]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add payout card
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#eadfd6] shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-[#2f251d]">Quick withdrawal</CardTitle>
            <CardDescription>
              Submit a payout request for the currently available guide balance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl bg-[#fffaf6] p-5">
              <p className="text-sm text-slate-500">Available now</p>
              <p className="mt-2 text-4xl font-semibold text-[#2f251d]">
                {formatCurrency(balance)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Latest month movement: {formatCurrency(monthDelta)}
              </p>
            </div>

            <div className="space-y-3">
              <Input
                type="number"
                min="0"
                value={withdrawAmount}
                onChange={(event) => setWithdrawAmount(event.target.value)}
                placeholder="Enter withdrawal amount"
                className="h-12 rounded-2xl border-[#d7c0af]"
              />
              <Button
                onClick={handleWithdrawalRequest}
                disabled={!card || busyAction === "withdraw"}
                className="h-12 w-full rounded-2xl bg-[#A18167] text-white hover:bg-[#8d705a]"
              >
                {busyAction === "withdraw" ? "Submitting request..." : "Request withdrawal"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-5">
        <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-[#f7efe8] p-1">
          <TabsTrigger value="overview" className="rounded-xl">Overview</TabsTrigger>
          <TabsTrigger value="transactions" className="rounded-xl">Transactions</TabsTrigger>
          <TabsTrigger value="withdrawals" className="rounded-xl">Withdrawals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="border-[#eadfd6] shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-[#2f251d]">Recent balance movement</CardTitle>
                <CardDescription>
                  Tracks the last recorded finance entries in your guide wallet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#efe4db" />
                      <XAxis dataKey="dateLabel" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Line type="monotone" dataKey="balance" stroke="#A18167" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#eadfd6] shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-[#2f251d]">Monthly earnings trend</CardTitle>
                <CardDescription>
                  Derived from the latest finance transactions recorded for your guide account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#efe4db" />
                      <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="earnings" fill="#2f251d" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="border-[#eadfd6] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-[#2f251d]">Latest transactions</CardTitle>
              <CardDescription>
                Recent credit and debit entries flowing through the guide wallet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {balanceHistory.length > 0 ? (
                balanceHistory.map((entry, index) => (
                  <div
                    key={`${entry.date}-${index}`}
                    className="flex flex-col gap-3 rounded-2xl border border-[#eadfd6] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-[#2f251d]">
                        {entry.description || (entry.type === "CREDIT" ? "Guide credit" : "Guide debit")}
                      </p>
                      <p className="text-sm text-slate-500">{formatShortDate(entry.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${entry.type === "CREDIT" ? "text-emerald-700" : "text-rose-600"}`}>
                        {entry.type === "CREDIT" ? "+" : "-"}
                        {formatCurrency(Math.abs(entry.balance))}
                      </p>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{entry.type}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#d7c0af] bg-[#fffaf6] p-8 text-center text-sm text-slate-500">
                  {isLoading ? "Loading transactions..." : "No finance transactions recorded yet."}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card className="border-[#eadfd6] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-[#2f251d]">Pending withdrawals</CardTitle>
              <CardDescription>
                Requests already submitted and waiting for admin action.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingWithdrawals.length > 0 ? (
                pendingWithdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="flex flex-col gap-3 rounded-2xl border border-[#eadfd6] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-[#2f251d]">{formatCurrency(withdrawal.amount)}</p>
                      <p className="text-sm text-slate-500">
                        Requested on {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                      Pending review
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#d7c0af] bg-[#fffaf6] p-8 text-center text-sm text-slate-500">
                  No pending withdrawals right now.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {status ? (
        <Alert
          className={`rounded-2xl border ${
            status.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      ) : null}

      {isAddingCard ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-lg rounded-[2rem] border-[#eadfd6]">
            <CardHeader>
              <CardTitle className="text-2xl text-[#2f251d]">Add payout card</CardTitle>
              <CardDescription>
                This card will be linked to future withdrawal requests.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="text"
                value={newCard.number}
                onChange={(event) =>
                  setNewCard((current) => ({ ...current, number: event.target.value }))
                }
                placeholder="Card number"
                className="h-12 rounded-2xl border-[#d7c0af]"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  type="text"
                  value={newCard.expiry}
                  onChange={(event) =>
                    setNewCard((current) => ({ ...current, expiry: event.target.value }))
                  }
                  placeholder="MM/YY"
                  className="h-12 rounded-2xl border-[#d7c0af]"
                />
                <Input
                  type="text"
                  value={newCard.cvv}
                  onChange={(event) =>
                    setNewCard((current) => ({ ...current, cvv: event.target.value }))
                  }
                  placeholder="CVV"
                  className="h-12 rounded-2xl border-[#d7c0af]"
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => setIsAddingCard(false)} className="rounded-full">
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCard}
                  disabled={busyAction === "card"}
                  className="rounded-full bg-[#2f251d] text-white hover:bg-[#1f1812]"
                >
                  {busyAction === "card" ? "Adding card..." : "Save card"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
