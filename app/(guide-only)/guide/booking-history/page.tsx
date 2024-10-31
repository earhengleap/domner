// app/booking-history/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import  prisma  from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";

async function getBookingHistory() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return null;
    }

    const bookings = await prisma.booking.findMany({
      where: {
        user: {
          email: session.user.email,
        },
      },
      select: {
        id: true,
        date: true,
        adultCount: true,
        status: true,
        totalPrice: true,
        createdAt: true,
        guidePost: {
          select: {
            title: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return bookings;
  } catch (error) {
    console.error("Error fetching booking history:", error);
    return null;
  }
}

function getStatusBadge(status: string) {
  const statusStyles = {
    CONFIRMED: "bg-green-500",
    PENDING: "bg-yellow-500",
    CANCELLED: "bg-red-500",
  };

  return (
    <Badge className={statusStyles[status as keyof typeof statusStyles]}>
      {status}
    </Badge>
  );
}

export default async function BookingHistoryPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const bookings = await getBookingHistory();

  if (!bookings) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Error loading booking history</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 py-36">
      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No booking history found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tour</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Booked On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {booking.guidePost.title}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {booking.guidePost.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{booking.adultCount}</TableCell>
                      <TableCell>${booking.totalPrice.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}