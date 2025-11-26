// utils/email.js
import nodemailer from "nodemailer";

// 6-digit OTP
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper: har call pe fresh transporter banao (tab tak .env load ho chuka hoga)
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log("📨 SMTP CONFIG (runtime):", { host, port, user });

  return nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendOtpEmail(to, subject, otp) {
  const text = `Your verification code is ${otp}. It is valid for 10 minutes.`;
  const html = `<p>Your verification code is <b>${otp}</b>. It is valid for 10 minutes.</p>`;

  console.log("📧 Trying to send OTP email to:", to);

  const transporter = createTransporter();

  try {
    const info = await transporter.sendMail({
      from: `"Taxi App" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ OTP email sent. messageId:", info.messageId);
  } catch (err) {
    console.error("❌ Error sending OTP email:", err.message);
    throw err; // taaki controller me bhi pata chale agar fail hua
  }
}
