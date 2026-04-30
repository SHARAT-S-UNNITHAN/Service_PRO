// server/services/emailService.js
const nodemailer = require("nodemailer");

// ─────────────────────────────────────────
// Transporter (Gmail SMTP)
// ─────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,   // your Gmail address
    pass: process.env.EMAIL_PASS,   // Gmail App Password (NOT your account password)
  },
});

// Verify connection on startup (optional but useful for debugging)
transporter.verify((err) => {
  if (err) console.error("[EMAIL] Transporter error:", err.message);
  else     console.log("[EMAIL] Mail service ready");
});

// ─────────────────────────────────────────
// FEATURE 1: Booking notification to provider
// ─────────────────────────────────────────
async function sendBookingNotificationToProvider({
  providerEmail,
  providerName,
  customerName,
  customerPhone,
  serviceDescription,
  scheduledDate,
  address,
  notes,
  bookingId,
}) {
  const formattedDate = scheduledDate
    ? new Date(scheduledDate).toLocaleString("en-IN", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : "Not specified";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Booking</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#00171F 0%,#003459 100%);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
              📋 New Booking Request
            </h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">
              Booking #${bookingId} — SmartService
            </p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:32px 40px 0;">
            <p style="margin:0;font-size:16px;color:#374151;">
              Hi <strong>${providerName}</strong>,
            </p>
            <p style="margin:12px 0 0;font-size:15px;color:#6b7280;line-height:1.6;">
              You have received a new booking request. Here are the details:
            </p>
          </td>
        </tr>

        <!-- Details card -->
        <tr>
          <td style="padding:24px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
              ${[
                ["👤 Customer Name",    customerName],
                ["📞 Phone",            customerPhone || "Not provided"],
                ["🔧 Service Required", serviceDescription],
                ["📅 Scheduled Date",   formattedDate],
                ["📍 Address",          address || "Not provided"],
                ["📝 Special Notes",    notes || "None"],
              ].map(([label, value], i) => `
              <tr style="background:${i % 2 === 0 ? "#f8fafc" : "#ffffff"};">
                <td style="padding:14px 20px;font-size:13px;color:#6b7280;font-weight:600;width:160px;white-space:nowrap;">${label}</td>
                <td style="padding:14px 20px;font-size:14px;color:#111827;border-left:1px solid #e5e7eb;">${value}</td>
              </tr>`).join("")}
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 40px 32px;text-align:center;">
            <p style="margin:0 0 20px;font-size:14px;color:#6b7280;">
              Log in to your dashboard to accept or reject this booking.
            </p>
            <a href="http://localhost:3000/provider/dashboard"
               style="display:inline-block;background:linear-gradient(135deg,#00171F,#003459);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:15px;font-weight:600;">
              View Dashboard →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              This email was sent by SmartService. Please do not reply to this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `
New Booking Request — SmartService
Booking #${bookingId}

Hi ${providerName},

You have a new booking request:

Customer: ${customerName}
Phone: ${customerPhone || "Not provided"}
Service: ${serviceDescription}
Date: ${formattedDate}
Address: ${address || "Not provided"}
Notes: ${notes || "None"}

Login to your dashboard to accept or reject: http://localhost:3000/provider/dashboard
  `.trim();

  return transporter.sendMail({
    from: `"SmartService" <${process.env.EMAIL_USER}>`,
    to: providerEmail,
    subject: `📋 New Booking Request #${bookingId} — ${customerName}`,
    html,
    text,
  });
}

// ─────────────────────────────────────────
// FEATURE 2: OTP email to customer
// ─────────────────────────────────────────
async function sendOtpToCustomer({
  customerEmail,
  customerName,
  providerName,
  serviceDescription,
  otp,
  bookingId,
}) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Work Completion OTP</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#00171F 0%,#003459 100%);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">
              ✅ Work Completion OTP
            </h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">
              Booking #${bookingId} — SmartService
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 40px 0;">
            <p style="margin:0;font-size:16px;color:#374151;">
              Hi <strong>${customerName}</strong>,
            </p>
            <p style="margin:12px 0 0;font-size:15px;color:#6b7280;line-height:1.6;">
              <strong>${providerName}</strong> has marked your booking for
              <strong>"${serviceDescription}"</strong> as completed.
            </p>
            <p style="margin:12px 0 0;font-size:15px;color:#6b7280;line-height:1.6;">
              Please share the OTP below with your service provider <strong>only if you are satisfied</strong> with the work:
            </p>
          </td>
        </tr>

        <!-- OTP box -->
        <tr>
          <td style="padding:32px 40px;text-align:center;">
            <div style="display:inline-block;background:#f0f9ff;border:2px dashed #003459;border-radius:16px;padding:28px 48px;">
              <p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-weight:600;letter-spacing:1px;text-transform:uppercase;">
                Your OTP Code
              </p>
              <p style="margin:0;font-size:48px;font-weight:800;color:#00171F;letter-spacing:12px;">
                ${otp}
              </p>
              <p style="margin:12px 0 0;font-size:12px;color:#ef4444;font-weight:600;">
                ⏰ Expires in 10 minutes
              </p>
            </div>
          </td>
        </tr>

        <!-- Warning -->
        <tr>
          <td style="padding:0 40px 32px;">
            <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:10px;padding:16px 20px;">
              <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
                ⚠️ <strong>Important:</strong> Only share this OTP with your service provider after confirming 
                the work is complete and satisfactory. Do NOT share with anyone else.
                If you did not request this, please ignore this email.
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              This email was sent by SmartService. Please do not reply.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `
Work Completion OTP — SmartService
Booking #${bookingId}

Hi ${customerName},

${providerName} has marked your booking for "${serviceDescription}" as completed.

Your OTP Code: ${otp}

This OTP expires in 10 minutes.

IMPORTANT: Only share this OTP with your service provider after confirming the work is satisfactory.
  `.trim();

  return transporter.sendMail({
    from: `"SmartService" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `✅ OTP for Work Completion — Booking #${bookingId}`,
    html,
    text,
  });
}

module.exports = { sendBookingNotificationToProvider, sendOtpToCustomer };