"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  DollarSign,
  CreditCard,
  Plus,
  AlertCircle,
  Trash2,
} from "lucide-react";

const GuideFincanceDashboard = () => {
  const [balance, setBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [balanceHistory, setBalanceHistory] = useState([]);
  const [status, setStatus] = useState(null);
  const [card, setCard] = useState(null);
  const [newCard, setNewCard] = useState({ number: "", expiry: "", cvv: "" });
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);

  useEffect(() => {
    fetchBalanceData();
    fetchCard();
    fetchPendingWithdrawals();
  }, []);

  const fetchBalanceData = async () => {
    try {
      const response = await fetch("/api/guide/finance");
      const data = await response.json();
      setBalance(data.balance);
      setBalanceHistory(data.history);
    } catch (error) {
      console.error("Failed to fetch balance data:", error);
      setStatus({ type: "error", message: "Failed to fetch balance data." });
    }
  };

  const fetchCard = async () => {
    try {
      const response = await fetch("/api/guide/cards");
      const data = await response.json();
      setCard(data.card);
    } catch (error) {
      console.error("Failed to fetch card:", error);
      setStatus({
        type: "error",
        message: "Failed to fetch card information.",
      });
    }
  };

  const fetchPendingWithdrawals = async () => {
    try {
      const response = await fetch("/api/guide/pending-withdrawals");
      const data = await response.json();
      setPendingWithdrawals(data.withdrawals);
    } catch (error) {
      console.error("Failed to fetch pending withdrawals:", error);
      setStatus({
        type: "error",
        message: "Failed to fetch pending withdrawals.",
      });
    }
  };

  const handleWithdrawalRequest = async () => {
    if (!card) {
      setStatus({
        type: "error",
        message: "Please add a card for withdrawal.",
      });
      return;
    }
    try {
      const withdrawalData = {
        amount: parseFloat(withdrawAmount),
        method: "BANK_TRANSFER", // Ensure this matches the enum on the server
        methodDetails: { cardId: card.id },
      };
      console.log("Withdrawal request data:", withdrawalData); // Log the request data

      const response = await fetch("/api/guide/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withdrawalData),
      });

      const data = await response.json();
      console.log("Withdrawal response:", response.status, data); // Log the full response

      if (response.ok) {
        setStatus({
          type: "success",
          message:
            "Withdrawal request submitted successfully! Awaiting admin approval.",
        });
        setWithdrawAmount("");
        fetchPendingWithdrawals();
      } else {
        setStatus({
          type: "error",
          message: data.error || "Failed to submit withdrawal request.",
        });
      }
    } catch (error) {
      console.error("Error submitting withdrawal request:", error);
      setStatus({
        type: "error",
        message: "An error occurred. Please try again.",
      });
    }
  };

  const handleAddCard = async () => {
    try {
      const response = await fetch("/api/guide/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCard),
      });
      const data = await response.json();
      if (response.ok) {
        setCard(data.card);
        setNewCard({ number: "", expiry: "", cvv: "" });
        setIsAddingCard(false);
        setStatus({ type: "success", message: "Card added successfully!" });
      } else {
        setStatus({
          type: "error",
          message: data.error || "Failed to add card.",
        });
      }
    } catch (error) {
      console.error("Error adding card:", error);
      setStatus({
        type: "error",
        message: "An error occurred. Please try again.",
      });
    }
  };

  const handleRemoveCard = async () => {
    try {
      const response = await fetch("/api/guide/cards", {
        method: "DELETE",
      });
      if (response.ok) {
        setCard(null);
        setStatus({ type: "success", message: "Card removed successfully!" });
      } else {
        const data = await response.json();
        setStatus({
          type: "error",
          message: data.error || "Failed to remove card.",
        });
      }
    } catch (error) {
      console.error("Error removing card:", error);
      setStatus({
        type: "error",
        message: "An error occurred. Please try again.",
      });
    }
  };

  const handleExportFinancialData = async () => {
    try {
      const response = await fetch("/api/guide/export-finance");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "financial_report.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export financial data:", error);
      setStatus({ type: "error", message: "Failed to export financial data." });
    }
  };
  const fetchMonthlyEarnings = async () => {
    try {
      const response = await fetch("/api/guide/monthly-earnings");
      const data = await response.json();
      setMonthlyEarnings(data.earnings);
    } catch (error) {
      console.error("Failed to fetch monthly earnings:", error);
      setStatus({
        type: "error",
        message: "Failed to fetch monthly earnings.",
      });
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-8xl mx-auto space-y-10">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
            Financial Dashboard
          </h1>
          <Button
            onClick={handleExportFinancialData}
            variant="outline"
            className="flex items-center text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <Download className="mr-2 h-5 w-5" /> Export Data
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="bg-white shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-blue-500 text-white p-4">
              <CardTitle className="text-lg font-semibold">
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-12 w-12 text-blue-500 mr-4" />
                <span className="text-3xl font-bold text-gray-800">
                  ${balance.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Available for withdrawal
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="bg-green-500 text-white p-4">
              <CardTitle className="text-lg font-semibold">
                Withdrawal Card
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {card ? (
                <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CreditCard className="h-8 w-8 text-green-500 mr-3" />
                    <span className="text-xl font-medium text-gray-800">
                      •••• {card.last4}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleRemoveCard}>
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsAddingCard(true)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg"
                >
                  <Plus className="mr-2 h-5 w-5" /> Add Card
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg rounded-xl overflow-hidden md:col-span-2">
            <CardHeader className="bg-purple-500 text-white p-4">
              <CardTitle className="text-lg font-semibold">
                Quick Withdrawal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex space-x-4">
                <Input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="border-gray-300 text-lg py-3 flex-grow"
                />
                <Button
                  onClick={handleWithdrawalRequest}
                  disabled={!card}
                  className="bg-purple-500 hover:bg-purple-600 text-white text-lg py-3 px-6 rounded-lg"
                >
                  Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs
          defaultValue="overview"
          className="bg-white shadow-lg rounded-xl overflow-hidden"
        >
          <TabsList className="p-4 bg-gray-100">
            <TabsTrigger value="overview" className="text-lg">
              Overview
            </TabsTrigger>
            <TabsTrigger value="history" className="text-lg">
              Balance History
            </TabsTrigger>
            <TabsTrigger value="earnings" className="text-lg">
              Monthly Earnings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white shadow-md rounded-lg overflow-hidden">
                <CardHeader className="bg-yellow-500 text-white p-4">
                  <CardTitle className="text-lg font-semibold">
                    Earnings Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={monthlyEarnings.slice(0, 3)}
                          dataKey="earnings"
                          nameKey="month"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          label
                        >
                          {monthlyEarnings.slice(0, 3).map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                ["#0088FE", "#00C49F", "#FFBB28"][index % 3]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-md rounded-lg overflow-hidden">
                <CardHeader className="bg-red-500 text-white p-4">
                  <CardTitle className="text-lg font-semibold">
                    Pending Withdrawals
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {pendingWithdrawals.length === 0 ? (
                    <p className="text-lg text-gray-500">
                      No pending withdrawals
                    </p>
                  ) : (
                    <ul className="space-y-4">
                      {pendingWithdrawals.map((withdrawal) => (
                        <li
                          key={withdrawal.id}
                          className="flex justify-between items-center bg-gray-50 p-4 rounded-lg"
                        >
                          <span className="text-xl font-semibold text-gray-800">
                            ${withdrawal.amount.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(
                              withdrawal.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="history" className="p-6">
            <Card className="bg-white shadow-md rounded-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-800">
                  Balance History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={balanceHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="earnings" className="p-6">
            <Card className="bg-white shadow-md rounded-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-800">
                  Monthly Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyEarnings}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="earnings" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {status && (
          <Alert
            className={`flex items-center ${
              status.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            } p-4 rounded-lg`}
          >
            <AlertCircle className="h-6 w-6 mr-2" />
            <AlertDescription className="text-base">
              {status.message}
            </AlertDescription>
          </Alert>
        )}

        {isAddingCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg bg-white rounded-xl overflow-hidden">
              <CardHeader className="bg-blue-500 text-white">
                <CardTitle className="text-2xl font-semibold">
                  Add New Card
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <Input
                    type="text"
                    value={newCard.number}
                    onChange={(e) =>
                      setNewCard({ ...newCard, number: e.target.value })
                    }
                    placeholder="Card Number"
                    className="border-gray-300 text-lg py-3"
                  />
                  <div className="grid grid-cols-2 gap-6">
                    <Input
                      type="text"
                      value={newCard.expiry}
                      onChange={(e) =>
                        setNewCard({ ...newCard, expiry: e.target.value })
                      }
                      placeholder="MM/YY"
                      className="border-gray-300 text-lg py-3"
                    />
                    <Input
                      type="text"
                      value={newCard.cvv}
                      onChange={(e) =>
                        setNewCard({ ...newCard, cvv: e.target.value })
                      }
                      placeholder="CVV"
                      className="border-gray-300 text-lg py-3"
                    />
                  </div>
                  <div className="flex space-x-6">
                    <Button
                      onClick={handleAddCard}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-lg py-3 rounded-lg"
                    >
                      Add Card
                    </Button>
                    <Button
                      onClick={() => setIsAddingCard(false)}
                      variant="outline"
                      className="flex-1 text-lg py-3 rounded-lg"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideFincanceDashboard;
