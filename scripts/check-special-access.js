const fs = require("fs");
const path = require("path");

function read(relPath) {
  return fs.readFileSync(path.join(__dirname, "..", relPath), "utf8");
}

function expectIncludes(source, snippet, message) {
  if (!source.includes(snippet)) {
    throw new Error(message);
  }
}

const middleware = read("middleware.ts");
const adminDashboard = read("app/(office)/admin/dashboard/page.tsx");
const guideProfileRoute = read("app/api/guide-profile/route.ts");
const access = read("lib/access.ts");

expectIncludes(
  middleware,
  "isSpecialMultiRoleUser",
  "middleware is not using the shared special-access helper"
);
expectIncludes(
  adminDashboard,
  "hasAdminAccess",
  "admin dashboard does not use shared admin access"
);
expectIncludes(
  guideProfileRoute,
  "hasGuideAccess",
  "guide profile route does not use shared guide access"
);
expectIncludes(
  access,
  "process.env.SPECIAL_MULTI_ROLE_EMAILS",
  "special multi-role emails are not loaded from environment"
);
if (access.includes("hengleap70@gmail.com")) {
  throw new Error("special multi-role email is still hardcoded in lib/access.ts");
}

process.stdout.write("special access wiring verified\n");
