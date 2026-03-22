const fs = require("fs");
const path = require("path");

function exists(relPath) {
  return fs.existsSync(path.join(__dirname, "..", relPath));
}

function read(relPath) {
  return fs.readFileSync(path.join(__dirname, "..", relPath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(
  exists("app/(frontend)/booking-history/page.tsx"),
  "user booking history page does not exist"
);

assert(
  exists("app/api/bookings/stats/route.ts"),
  "booking stats route does not exist"
);

assert(
  exists("app/api/bookings/[id]/cancel-request/route.ts"),
  "booking cancel-request route does not exist"
);

assert(
  exists("app/api/guide/cancel-requests/route.ts"),
  "guide cancel-requests list route does not exist"
);

assert(
  exists("app/api/guide/cancel-requests/[id]/route.ts"),
  "guide cancel-requests action route does not exist"
);

const bookingList = read("components/UserBookingList.tsx");
assert(
  bookingList.includes('fetch("/api/booking-history")'),
  "user booking list is not wired to /api/booking-history"
);
assert(
  bookingList.includes('fetch(`/api/bookings/${bookingId}`'),
  "user booking list is not wired to /api/bookings/[id]"
);

const bookingStats = read("components/UserBookingStats.tsx");
assert(
  bookingStats.includes('fetch("/api/bookings/stats")'),
  "user booking stats is not wired to /api/bookings/stats"
);

process.stdout.write("user booking history wiring verified\n");
