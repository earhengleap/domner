const fs = require("fs");
const path = require("path");

const authOptionsPath = path.join(__dirname, "..", "lib", "authOptions.ts");
const source = fs.readFileSync(authOptionsPath, "utf8");

if (source.includes('role: "USER"')) {
  throw new Error('Google profile still hardcodes role "USER"');
}

if (!source.includes("const dbUser = await db.user.findUnique")) {
  throw new Error("JWT callback does not load the database user");
}

if (!source.includes("token.role = dbUser.role")) {
  throw new Error("JWT callback does not prefer the database role");
}

process.stdout.write("auth role sync verified\n");
