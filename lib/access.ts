type AccessUser = {
  email?: string | null;
  role?: string | null;
};

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() ?? "";
}

function loadSpecialMultiRoleEmails() {
  const rawEmails =
    process.env.SPECIAL_MULTI_ROLE_EMAILS ??
    process.env.NEXT_PUBLIC_SPECIAL_MULTI_ROLE_EMAILS ??
    "";
  return new Set(
    rawEmails
      .split(",")
      .map((email) => normalizeEmail(email))
      .filter(Boolean)
  );
}

const SPECIAL_MULTI_ROLE_EMAILS = loadSpecialMultiRoleEmails();

export function isSpecialMultiRoleUser(user?: AccessUser | null) {
  return SPECIAL_MULTI_ROLE_EMAILS.has(normalizeEmail(user?.email));
}

export function hasAdminAccess(user?: AccessUser | null) {
  return user?.role === "ADMIN" || isSpecialMultiRoleUser(user);
}

export function hasGuideAccess(user?: AccessUser | null) {
  return user?.role === "GUIDE" || isSpecialMultiRoleUser(user);
}

export function getDefaultAuthenticatedPath(user?: AccessUser | null) {
  if (hasAdminAccess(user)) {
    return "/admin/dashboard";
  }

  if (hasGuideAccess(user)) {
    return "/guide-dashboard";
  }

  return "/";
}
