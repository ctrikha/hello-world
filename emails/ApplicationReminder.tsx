interface Props {
  studentName: string;
  collegeName: string;
  deadline: string;
  daysLeft: number;
  appUrl: string;
}

export function ApplicationReminderEmail({
  studentName,
  collegeName,
  deadline,
  daysLeft,
  appUrl,
}: Props) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111;">
  <h2 style="color: #4f46e5;">Application Deadline Reminder</h2>
  <p>Hi ${studentName},</p>
  <p>
    Your application to <strong>${collegeName}</strong> is due in
    <strong>${daysLeft} day${daysLeft !== 1 ? "s" : ""}</strong>
    (${deadline}).
  </p>
  <p>
    <a href="${appUrl}/dashboard/applications"
       style="background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
      View my applications
    </a>
  </p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
  <p style="color: #9ca3af; font-size: 13px;">College Advisory Platform</p>
</body>
</html>`;
}
