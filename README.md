# Hemant's Portfolio — Full React App

A complete developer portfolio built with React + Vite, featuring:
- **Email integration** via EmailJS (contact form → your inbox)
- **Visitor tracking** — count, country, city, referrer logged in Supabase
- **Admin dashboard** — see visitors, read messages, manage projects, toggle availability
- **Live content editing** — flip "Open to Work", "Freelance available", update looking-for text

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Database / Tracking | Supabase (PostgreSQL) |
| Email | EmailJS |
| Styling | CSS Modules + CSS Variables |
| Notifications | react-hot-toast |
| Icons | Lucide React |

---

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx / .module.css
│   ├── Hero.jsx / .module.css
│   ├── About.jsx / .module.css
│   ├── Experience.jsx / .module.css
│   ├── Projects.jsx / .module.css
│   ├── Skills.jsx / .module.css
│   ├── Contact.jsx / .module.css
│   └── Footer.jsx / .module.css
├── context/
│   └── PortfolioContext.jsx     ← loads settings + projects from Supabase
├── data/
│   └── portfolio.js             ← default fallback data
├── hooks/
│   └── useVisitorTrack.js       ← fires on every page load
├── lib/
│   ├── supabase.js              ← all DB operations
│   └── emailjs.js               ← sends contact form email
├── pages/
│   ├── Home.jsx
│   ├── Admin.jsx                ← full dashboard
│   └── AdminLogin.jsx
├── styles/
│   └── global.css
├── App.jsx
└── main.jsx
```

---

## Setup — Step by Step

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Go to [supabase.com](https://supabase.com) → create a free project
2. Open **SQL Editor** → paste the contents of `supabase_setup.sql` → **Run**
3. Go to **Project Settings → API** → copy:
   - Project URL
   - anon public key

### 3. Set up EmailJS
1. Go to [emailjs.com](https://www.emailjs.com) → create a free account
2. **Email Services** → Add Service (Gmail, Outlook, etc.) → note the **Service ID**
3. **Email Templates** → Create Template with these variables:
   ```
   From: {{from_name}} <{{from_email}}>
   Subject: New Portfolio Contact from {{from_name}}
   Body:
     Name: {{from_name}}
     Email: {{from_email}}
     
     {{message}}
   ```
4. Note the **Template ID**
5. **Account → API Keys** → copy your **Public Key**

### 4. Create your .env file
```bash
cp .env.example .env
```
Fill in all values:
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_ADMIN_PASSWORD=choose_a_strong_password
```

### 5. Run locally
```bash
npm run dev
```

### 6. Build for production
```bash
npm run build
```

---

## Admin Dashboard

Visit `/admin/login` → enter your `VITE_ADMIN_PASSWORD`.

From the dashboard you can:
- **Overview** — total visitors, today's count, unread messages, top countries
- **Visitors** — full table: timestamp, country, city, IP, referrer
- **Messages** — read all contact form submissions, mark as read, reply via email
- **Projects** — add / edit / delete projects with a form modal, toggle featured
- **Settings** — toggle "Open to Work", "Available for Freelance", update looking-for text

All changes in Settings and Projects are instantly reflected on the live portfolio.

---

## Personalizing

Before deploying, update these in the code:

| File | What to change |
|---|---|
| `src/components/Hero.jsx` | Your GitHub / LinkedIn / email links |
| `src/components/Contact.jsx` | Your email, LinkedIn, GitHub URLs |
| `src/components/Footer.jsx` | Social links |
| `src/data/portfolio.js` | Default projects (used before Supabase is set up) |
| `public/hemant-resume.pdf` | Drop your actual resume PDF here |
| `public/favicon.svg` | Your custom favicon |

---

## Deployment (Vercel — recommended)

```bash
npm install -g vercel
vercel
```

Set all `.env` variables in Vercel → Project → Settings → Environment Variables.

---

## Features Summary

| Feature | How |
|---|---|
| Contact form → your email | EmailJS (no backend needed) |
| Contact submissions saved | Supabase `contacts` table |
| Visitor count | Supabase `visitors` table, IP geolocation via ipapi.co |
| Admin login | Password stored in env, session-guarded |
| Toggle "Open to Work" | Supabase `portfolio_settings`, reflected live |
| Add/edit/delete projects | Supabase `projects` table via admin panel |
| Default data fallback | `src/data/portfolio.js` — works even without Supabase |
