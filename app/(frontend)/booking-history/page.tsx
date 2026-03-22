import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import UserBookingHistoryPage from "@/components/UserBookingHistoryPage";

export default async function BookingHistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return <UserBookingHistoryPage />;
}
