"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { Minus, Plus, RefreshCw } from "lucide-react";

export default function FeeManagement() {
  const [currentFee, setCurrentFee] = useState(0);
  const [newFee, setNewFee] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void fetchCurrentFee();
  }, []);

  const fetchCurrentFee = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/fee-config", { cache: "no-store" });
      const data = await response.json();
      const feePercent = Number((Number(data.feeRate || 0.1) * 100).toFixed(2));
      setCurrentFee(feePercent);
      setNewFee(String(feePercent));
    } catch (error) {
      console.error("Failed to fetch current fee:", error);
      toast.error("Failed to load current fee");
    } finally {
      setIsLoading(false);
    }
  };

  const adjustFee = (delta: number) => {
    const parsed = Number.parseFloat(newFee);
    const base = Number.isFinite(parsed) ? parsed : currentFee;
    const next = Math.max(0, Math.min(100, Number((base + delta).toFixed(2))));
    setNewFee(String(next));
  };

  const handleUpdateFee = async () => {
    const numericPercent = Number.parseFloat(newFee);
    const feeRate = numericPercent / 100;

    if (!Number.isFinite(feeRate) || feeRate < 0 || feeRate > 1) {
      toast.error("Please enter a valid percentage between 0 and 100");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/admin/fee-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feeRate }),
      });

      if (response.ok) {
        toast.success("Fee updated successfully");
        setCurrentFee(Number(numericPercent.toFixed(2)));
      } else {
        toast.error("Failed to update fee");
      }
    } catch (error) {
      console.error("Error updating fee:", error);
      toast.error("An error occurred while updating the fee");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[30vh] flex items-center justify-center">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Royalty Fee Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Configure the platform fee deducted from each booking.</p>
          </div>

          <button
            type="button"
            onClick={() => void fetchCurrentFee()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Reload
          </button>
        </div>
      </section>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Fee Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Current Fee</p>
            <p className="text-2xl font-semibold text-slate-900 mt-1">{currentFee.toFixed(2)}%</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">New Fee Percentage</label>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="icon" onClick={() => adjustFee(-1)}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={newFee}
                onChange={(event) => setNewFee(event.target.value)}
                placeholder="New fee percentage"
                min="0"
                max="100"
                step="0.01"
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon" onClick={() => adjustFee(1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Example: 10 means 10% platform fee per booking.
            </p>
          </div>

          <Button onClick={handleUpdateFee} disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? "Saving..." : "Update Fee"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
