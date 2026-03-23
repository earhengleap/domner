import nodemailer from "nodemailer";

interface SendPasswordResetEmailParams {
  to: string;
  resetUrl: string;
  name?: string | null;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getBrevoSmtpConfig() {
  const host = process.env.BREVO_SMTP_HOST;
  const port = Number(process.env.BREVO_SMTP_PORT || "587");
  const user = process.env.BREVO_SMTP_LOGIN;
  const pass = process.env.BREVO_SMTP_PASSWORD;
  const allowSelfSigned = process.env.BREVO_SMTP_ALLOW_SELF_SIGNED === "true";

  if (!host || !user || !pass) {
    throw new Error("Brevo SMTP configuration is missing");
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: allowSelfSigned ? { rejectUnauthorized: false } : undefined,
  };
}

function getSender() {
  const email = process.env.BREVO_SENDER_EMAIL;
  const name = process.env.BREVO_SENDER_NAME || "Domner";

  if (!email) {
    throw new Error("BREVO_SENDER_EMAIL is missing");
  }

  return `"${name}" <${email}>`;
}

let transport: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transport) {
    return transport;
  }

  transport = nodemailer.createTransport(getBrevoSmtpConfig());
  return transport;
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  name,
}: SendPasswordResetEmailParams) {
  const userName = name?.trim() || "there";
  const safeName = escapeHtml(userName);
  const subject = "Reset your Domner password";
  const text = `Hi ${userName},\n\nWe received a request to reset your password.\n\nUse this link to reset it: ${resetUrl}\n\nThis link expires in 1 hour.\nIf you did not request this, you can ignore this email.`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <p>Hi ${safeName},</p>
      <p>We received a request to reset your password.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#A18167;color:#ffffff;text-decoration:none;border-radius:8px;">
          Reset Password
        </a>
      </p>
      <p>Or paste this URL in your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>
  `;

  await getTransporter().sendMail({
    from: getSender(),
    to,
    subject,
    text,
    html,
  });
}
