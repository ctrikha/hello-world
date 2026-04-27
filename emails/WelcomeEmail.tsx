interface Props {
  name: string;
  role: string;
  appUrl: string;
}

export function WelcomeEmail({ name, role, appUrl }: Props) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111;">
  <h2 style="color: #4f46e5;">Welcome to College Advisory!</h2>
  <p>Hi ${name},</p>
  <p>
    Your ${role.toLowerCase()} account is ready. Here's what you can do next:
  </p>
  ${
    role === "STUDENT"
      ? `<ul>
    <li>Complete your academic profile</li>
    <li>Search and bookmark colleges</li>
    <li>Track your applications on the Kanban board</li>
    <li>Message your advisor</li>
  </ul>`
      : `<ul>
    <li>Complete your advisor profile</li>
    <li>View your assigned students</li>
    <li>Set your availability for meetings</li>
  </ul>`
  }
  <p>
    <a href="${appUrl}/dashboard"
       style="background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
      Go to dashboard
    </a>
  </p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
  <p style="color: #9ca3af; font-size: 13px;">College Advisory Platform</p>
</body>
</html>`;
}
