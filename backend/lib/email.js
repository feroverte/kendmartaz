import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = "noreply@kendmart.com";

let resend = null;
if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
}

export async function sendOtpEmail(to, otp) {
  if (!resend) {
    console.log(`[EMAIL] Would send OTP ${otp} to ${to} (no RESEND_API_KEY configured)`);
    return { success: true };
  }
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Your KendMart Password Reset Code",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <div style="background:#065f46;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
            <h1 style="color:#fff;margin:0;font-size:20px;">KendMart</h1>
          </div>
          <h2 style="color:#064e3b;font-size:18px;">Password Reset Code</h2>
          <p style="color:#444;font-size:14px;line-height:1.6;">
            Use the code below to reset your password. It expires in 10 minutes.
          </p>
          <div style="background:#f3f4f6;border-radius:10px;padding:16px;text-align:center;margin:20px 0;">
            <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#065f46;">${otp}</span>
          </div>
          <p style="color:#888;font-size:12px;">
            If you didn't request a password reset, you can ignore this email.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
          <p style="color:#aaa;font-size:11px;text-align:center;">
            KendMart &mdash; Supporting Sustainable Farmers
          </p>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return { success: false, error: error.message };
  }
}
