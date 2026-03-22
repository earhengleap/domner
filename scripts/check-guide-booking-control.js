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
  exists("app/api/guide/bookings/route.ts"),
  "guide bookings API route does not exist"
);

assert(
  exists("app/api/guide/bookings/[id]/route.ts"),
  "guide booking action API route does not exist"
);

assert(
  exists("components/Guide/GuideBookingControlPage.tsx"),
  "guide booking control page component does not exist"
);

const page = read("app/(guide-only)/guide/booking-history/page.tsx");
assert(
  page.includes("GuideBookingControlPage"),
  "guide booking history route is not using the guide control page"
);

const api = read("app/api/guide/bookings/route.ts");
assert(
  api.includes("guidePost") && api.includes("user"),
  "guide bookings API does not include booking owner and tour data"
);

process.stdout.write("guide booking control verified\n");
