import CancelRequestList from "@/components/Guide/CancelRequestList";

export default function GuideCancelRequestsPage() {
  return (
    <div className="p-36 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl text-green-800 font-normal mb-2">
          Cancellation Requests
        </h1>
        <p className="text-muted-foreground">
          Approve or reject cancellation requests for confirmed bookings.
        </p>
      </div>
      <CancelRequestList />
    </div>
  );
}
