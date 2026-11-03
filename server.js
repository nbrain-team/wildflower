require("dotenv").config();

const path = require("path");
const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "128kb" }));
app.use(express.urlencoded({ extended: false, limit: "128kb" }));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SERVICES = new Set([
  "Private Lessons",
  "Day Training",
  "Board and Train",
  "Boarding (existing clients)",
  "Not sure yet"
]);

let mailer;

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function escHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[char]));
}

function getMailer() {
  if (mailer) return mailer;

  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    mailer = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
    return mailer;
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    mailer = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    return mailer;
  }

  throw new Error("Email is not configured. Set GMAIL_USER/GMAIL_APP_PASSWORD or SMTP_* env vars.");
}

function wantsJson(req) {
  return req.is("application/json") || String(req.get("accept") || "").includes("application/json");
}

function sendError(req, res, status, message) {
  if (wantsJson(req)) return res.status(status).json({ error: message });
  return res.status(status).send(message);
}

app.post("/api/eval", async (req, res) => {
  try {
    const body = req.body || {};

    // Honeypot: pretend success for bots so they do not learn the field worked.
    if (body._honey) {
      if (wantsJson(req)) return res.json({ ok: true });
      return res.redirect(303, "/thank-you.html");
    }

    const inquiry = {
      name: clean(body.name, 100),
      email: clean(body.email, 160).toLowerCase(),
      phone: clean(body.phone, 60),
      dogName: clean(body.dog_name, 100),
      dogDetails: clean(body.dog_details, 160),
      service: clean(body.service, 80),
      message: clean(body.message, 3000)
    };

    if (!inquiry.name || !inquiry.email || !inquiry.dogName || !inquiry.service || !inquiry.message) {
      return sendError(req, res, 400, "Please fill out all required fields.");
    }
    if (!EMAIL_RE.test(inquiry.email)) {
      return sendError(req, res, 400, "Please enter a valid email address.");
    }
    if (!SERVICES.has(inquiry.service)) {
      return sendError(req, res, 400, "Please choose a valid service.");
    }

    const to = process.env.NOTIFY_EMAIL || "wildflowercanines@gmail.com";
    const fromEmail = process.env.MAIL_FROM || process.env.GMAIL_USER || process.env.SMTP_USER;
    if (!fromEmail) throw new Error("MAIL_FROM, GMAIL_USER, or SMTP_USER must be set.");

    const subject = `New eval request from ${inquiry.name}${inquiry.dogName ? ` about ${inquiry.dogName}` : ""}`;
    const rows = [
      ["Name", inquiry.name],
      ["Email", inquiry.email],
      ["Phone", inquiry.phone || "-"],
      ["Dog", `${inquiry.dogName}${inquiry.dogDetails ? ` - ${inquiry.dogDetails}` : ""}`],
      ["Service", inquiry.service],
      ["Message", inquiry.message]
    ];
    const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
    const html = [
      "<table cellpadding=\"6\" cellspacing=\"0\" border=\"0\">",
      ...rows.map(([label, value]) => `<tr><th align="left">${escHtml(label)}</th><td>${escHtml(value).replace(/\n/g, "<br>")}</td></tr>`),
      "</table>"
    ].join("");

    await getMailer().sendMail({
      from: `"${process.env.MAIL_FROM_NAME || "Wildflower Canines"}" <${fromEmail}>`,
      to,
      replyTo: inquiry.email,
      subject,
      text,
      html
    });

    if (wantsJson(req)) return res.json({ ok: true });
    return res.redirect(303, "/thank-you.html");
  } catch (err) {
    console.error("eval request failed:", err);
    return sendError(req, res, 500, "Something went wrong sending your eval request. Please try again in a moment.");
  }
});

app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

app.get("/healthz", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Wildflower Canines running on :${PORT}`);
});
