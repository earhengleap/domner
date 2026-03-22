const fs = require("fs");
const path = require("path");

function read(relPath) {
  return fs.readFileSync(path.join(__dirname, "..", relPath), "utf8");
}

function exists(relPath) {
  return fs.existsSync(path.join(__dirname, "..", relPath));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(
  exists("app/(frontend)/booking-history/[id]/page.tsx"),
  "booking detail page does not exist"
);

const list = read("components/UserBookingList.tsx");
assert(
  list.includes("router.push(`/booking-history/${booking.id}`)"),
  "booking list does not navigate to booking detail page"
);

const detail = read("components/UserBookingDetailPage.tsx");
assert(
  detail.includes("Selected booking date"),
  "booking detail page does not show selected booking date"
);

const api = read("app/api/bookings/[id]/route.ts");
assert(
  api.includes("guidePost: {"),
  "booking detail API is missing guide post details"
);

process.stdout.write("booking detail view verified\n");
