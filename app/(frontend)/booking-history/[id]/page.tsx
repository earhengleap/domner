import UserBookingDetailPage from "@/components/UserBookingDetailPage";

export default function BookingHistoryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <UserBookingDetailPage bookingId={params.id} />;
}
