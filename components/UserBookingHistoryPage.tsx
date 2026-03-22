import UserBookingList from "@/components/UserBookingList";
import { UserBookingStats } from "@/components/UserBookingStats";

export default function UserBookingHistoryPage() {
  return (
    <div className="min-h-screen bg-[#fdfbf9] pt-32 pb-16 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl font-bold text-[#A18167] mb-2 tracking-tight">
            Booking History
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage pending bookings and request guide approval for confirmed-trip cancellations.
          </p>
        </div>
        <UserBookingStats />
        <UserBookingList />
      </div>
    </div>
  );
}
