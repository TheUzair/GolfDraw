import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

export function drawResultEmail(name: string, month: string, year: number) {
  return {
    subject: `Draw Results for ${month} ${year}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Monthly Draw Results Are In!</h2>
        <p>Hi ${name},</p>
        <p>The draw results for ${month} ${year} have been published. Log in to check if you're a winner!</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px;">View Results</a>
      </div>
    `,
  };
}

export function winnerNotificationEmail(name: string, prize: number) {
  return {
    subject: "Congratulations! You're a Winner!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>🎉 You Won!</h2>
        <p>Hi ${name},</p>
        <p>Congratulations! You've won <strong>£${prize.toFixed(2)}</strong> in this month's draw!</p>
        <p>Please upload your score verification proof to claim your prize.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/winnings" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px;">Claim Prize</a>
      </div>
    `,
  };
}

export function subscriptionEmail(name: string, plan: string) {
  return {
    subject: "Welcome to the Platform!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome Aboard!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for subscribing to the <strong>${plan}</strong> plan. You're now part of something special!</p>
        <p>Start entering your scores and get ready for the next monthly draw.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px;">Go to Dashboard</a>
      </div>
    `,
  };
}
