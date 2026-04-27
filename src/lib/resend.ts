import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set, skipping email to", params.to);
    return { success: false };
  }

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "noreply@example.com",
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  if (error) {
    console.error("[email] Failed to send:", error);
    return { success: false };
  }

  return { success: true };
}
