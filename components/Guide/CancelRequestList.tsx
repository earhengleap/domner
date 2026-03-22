'use client'

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface CancelRequest {
  id: string;
  bookingId: string;
  bookingTitle: string;
  requestedDate: string | null;
  requesterName: string;
  requesterEmail: string;
  adultCount: number;
  totalPrice: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export default function CancelRequestList() {
  const [requests, setRequests] = useState<CancelRequest[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/guide/cancel-requests");
      if (!response.ok) throw new Error("Failed to fetch cancellation requests");
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load cancellation requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (
    requestId: string,
    action: "approve" | "reject"
  ) => {
    try {
      setBusyId(requestId);
      const response = await fetch(`/api/guide/cancel-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update request");
      }

      toast({
        title: "Updated",
        description:
          action === "approve"
            ? "Cancellation request approved"
            : "Cancellation request rejected",
      });

      await fetchRequests();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update request",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  const pendingRequests = requests.filter((request) => request.status === "PENDING");
  const processedRequests = requests.filter((request) => request.status !== "PENDING");

  const renderRequest = (request: CancelRequest) => (
    <Card key={request.id}>
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg">{request.bookingTitle}</h3>
            <p className="text-sm text-muted-foreground">
              Requested by {request.requesterName || request.requesterEmail}
            </p>
          </div>
          <Badge
            className={
              request.status === "PENDING"
                ? "bg-amber-100 text-amber-800"
                : request.status === "APPROVED"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
            }
          >
            {request.status}
          </Badge>
        </div>

        <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          <p>Booking date: {request.requestedDate ? new Date(request.requestedDate).toLocaleDateString() : "N/A"}</p>
          <p>Guests: {request.adultCount}</p>
          <p>Total: ${request.totalPrice.toFixed(2)}</p>
          <p>Requested on: {new Date(request.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="rounded-lg bg-muted/40 p-3 text-sm">
          <span className="font-medium">Reason:</span>{" "}
          {request.reason || "No reason provided."}
        </div>

        {request.status === "PENDING" && (
          <div className="flex gap-2">
            <Button
              disabled={busyId === request.id}
              onClick={() => handleAction(request.id, "approve")}
            >
              Approve
            </Button>
            <Button
              variant="outline"
              disabled={busyId === request.id}
              onClick={() => handleAction(request.id, "reject")}
            >
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <div className="loader" />;
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Pending Requests</h2>
          <p className="text-muted-foreground">
            Review cancellation requests from travelers before confirmed trips are cancelled.
          </p>
        </div>
        {pendingRequests.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-muted-foreground">
              No pending cancellation requests.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">{pendingRequests.map(renderRequest)}</div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Recent Decisions</h2>
        </div>
        {processedRequests.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-muted-foreground">
              No processed requests yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">{processedRequests.map(renderRequest)}</div>
        )}
      </section>
    </div>
  );
}
