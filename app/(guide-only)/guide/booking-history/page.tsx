import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { hasGuideAccess } from "@/lib/access";
import GuideBookingControlPage from "@/components/Guide/GuideBookingControlPage";

export default async function GuideBookingHistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (!hasGuideAccess(session.user)) {
    redirect("/");
  }

  return <GuideBookingControlPage />;
}
