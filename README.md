# Wildflower Canines — Website

Marketing site for Wildflower Canines, a Las Vegas dog training and boarding company. Plain HTML/CSS frontend served by a small Node/Express backend that handles eval request emails.

## Structure

```
server.js            Backend: static files + POST /api/eval email endpoint
package.json         Node runtime dependencies and start script
public/
├── index.html       Home: hero, services preview, about Bri, testimonials, contact CTA
├── about.html       Story, Luke 12:27 philosophy, mission/vision, values, photo gallery
├── services.html    Private Lessons, Day Training, Board and Train, Boarding, how to start
├── book-eval.html     Themed Book an Eval page and form (name, email, phone, dog info, service, message)
├── contact.html     Legacy contact page with the original contact form
├── 404.html
└── assets/
    ├── css/style.css   All styles; brand colors live in :root
    ├── js/main.js      Nav, scroll reveals, socials, contact form
    ├── brand/          Logo, wordmark, favicons, botanical line art (SVG)
    └── img/            Web-optimized photos
```

## Settings to update

Form submissions post to `/api/eval`, which sends email from the backend with Nodemailer.

- `NOTIFY_EMAIL` — where eval/contact form submissions are emailed. Defaults to `wildflowercanines@gmail.com`.
- `GMAIL_USER` + `GMAIL_APP_PASSWORD` — preferred Gmail sender credentials.
- Optional SMTP fallback: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`.
- `MAIL_FROM_NAME` / `MAIL_FROM` — optional sender name/address overrides.
- `social.instagram` / `facebook` / `tiktok` — full profile URLs. Icons appear in the footer only for the ones that are filled in.

## Brand

- Colors: cream `#FBF7EC`, sand dune `#E9E1C4`, thistle `#D3BBDD`, vanilla custard `#FEEAAE`, almond silk `#EBCCC1`, powder blue `#B9C9DF`, ash grey `#ADB5A6`, sage `#8A9683` (buttons), deep plum `#4A3A6B` (all text), brown `#7B4331` (tiny details only).
- Fonts: Quicksand (headings), Poppins (body), from Google Fonts.
- No pricing anywhere on the site; visitors are directed to the contact form.

## Local preview

```bash
npm install
cp .env.example .env
# Fill in Gmail or SMTP env vars
npm start
# open http://localhost:3000
```

## Deploy

Render should run this as a Node Web Service, not a Static Site:

- Build command: `npm install`
- Start command: `npm start`
- Required env vars: `NOTIFY_EMAIL`, plus either `GMAIL_USER` + `GMAIL_APP_PASSWORD` or the `SMTP_*` set.
- Auto-deploy from `main` can remain enabled.
