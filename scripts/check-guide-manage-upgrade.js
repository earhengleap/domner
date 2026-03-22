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
  exists("components/Guide/ManagePostEditor.tsx"),
  "guide manage editor component does not exist"
);

const managePage = read("app/(guide-only)/guide-dashboard/manage/page.tsx");
assert(
  managePage.includes("ManagePostEditor"),
  "manage page is not using the upgraded manage editor"
);

const singlePostApi = read("app/api/guide-posts/[id]/route.ts");
assert(
  singlePostApi.includes("lockedDates"),
  "guide post API is not exposing locked booking dates"
);

process.stdout.write("guide manage upgrade verified\n");
