# Wildflower Canines — Website

Marketing site for Wildflower Canines, a Las Vegas dog training and boarding company. Plain HTML/CSS/JS with no build step, deployed as a Render static site.

## Structure

```
public/
├── index.html       Home: hero, services preview, about Bri, testimonials, contact CTA
├── about.html       Story, Luke 12:27 philosophy, mission/vision, values, photo gallery
├── services.html    Private Lessons, Day Training, Board and Train, Boarding, how to start
├── contact.html     Inquiry form (name, email, phone, dog info, service, message)
├── 404.html
└── assets/
    ├── css/style.css   All styles; brand colors live in :root
    ├── js/main.js      Nav, scroll reveals, socials, contact form
    ├── brand/          Logo, wordmark, favicons, botanical line art (SVG)
    └── img/            Web-optimized photos
```

## Settings to update

All in the `SITE` object at the top of `public/assets/js/main.js`:

- `formEmail` — where contact form submissions are emailed (via [FormSubmit](https://formsubmit.co), no API key). The first submission to a new address triggers a one-time activation email that must be confirmed.
- `social.instagram` / `facebook` / `tiktok` — full profile URLs. Icons appear in the footer only for the ones that are filled in.

## Brand

- Colors: cream `#FBF7EC`, sand dune `#E9E1C4`, thistle `#D3BBDD`, vanilla custard `#FEEAAE`, almond silk `#EBCCC1`, powder blue `#B9C9DF`, ash grey `#ADB5A6`, sage `#8A9683` (buttons), deep plum `#4A3A6B` (all text), brown `#7B4331` (tiny details only).
- Fonts: Quicksand (headings), Poppins (body), from Google Fonts.
- No pricing anywhere on the site; visitors are directed to the contact form.

## Local preview

```bash
cd public && python3 -m http.server 8765
# open http://localhost:8765
```

## Deploy

Render static site, publish directory `public`, auto-deploys on every push to `main`.
