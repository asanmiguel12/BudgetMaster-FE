# Deploy Budget Master landing page to Vercel

This folder is a **static project page** for recruiters and portfolio visitors — not the mobile app itself.

**Live site (after deploy):** `https://your-project.vercel.app`

## What's included

- Hero with app screenshot and tech stack
- Feature highlights
- On-track progress formula
- Demo video placeholder (add your YouTube/Loom embed)
- Architecture overview
- GitHub link

## Deploy to Vercel (recommended)

### Option A: Vercel Dashboard

1. Push this repo to GitHub: `https://github.com/asanmiguel12/BudgetMaster`
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the **BudgetMaster** repository
4. Set **Root Directory** to `landing`
5. Framework Preset: **Other** (static — no build command)
6. Click **Deploy**

### Option B: Vercel CLI

```bash
npm i -g vercel
cd landing
vercel
```

Follow prompts. For production:

```bash
vercel --prod
```

## Custom domain (optional)

In Vercel → Project → Settings → Domains, add e.g. `budgetmaster.vercel.app` or your own domain.

## Add a demo video

1. Record a 30–60s screen capture on your iPhone or Simulator (Simulate Bank Notification flow)
2. Upload to [YouTube](https://youtube.com) (unlisted) or [Loom](https://loom.com)
3. In `index.html`, find the demo section and replace the placeholder with:

```html
<div class="video-embed">
  <iframe
    src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
    title="Budget Master demo"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
  ></iframe>
</div>
```

Remove the `video-placeholder` div when the embed is live.

## Update links

- GitHub: already points to `asanmiguel12/BudgetMaster`
- App Store: replace "coming soon" in `index.html` when you publish

## Local preview

```bash
cd landing
npx serve .
# or: python3 -m http.server 8080
```

Open `http://localhost:8080`
