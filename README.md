# Moments Behind Money

> **Know where your money goes. Understand what it means.**

A privacy-first clarity layer between your bank and your financial decisions.

---

## Page Architecture & Layout

1. **Hero Section**:
   - **Refined Typography**: The headline font size matches the section title scale (43px) for a balanced editorial look.
   - **Philosophy Flow (`.heroFlow`)**: Compact 3-step diagram placed directly under the title in the `.dataFlow` style (*Your bank statement* → *Your financial clarity* → *Your decisions*) with the text wall removed.
   - **Hero Visual Card with Dual Toggle**:
     - **Insights (Pictures)**: Interactive 6-month chart with concrete spending chips updating per month (e.g., November move setup & groceries).
     - **Clarity (Questions)**: Interactive switcher answering the 4 core questions users actually ask with simulated AI analysis and mini bar breakdowns.
2. **Interactive Demo (`01 / SEE IT IN PRACTICE`)**: All three steps share the upload's 480px frame. The CSV arrives, transaction rows appear and are categorized, then the chart draws and a preview cursor clicks April to reveal a short Albert Heijn insight. The chat immediately types and sends a sample question, shows a thinking indicator, and streams the answer and chart. Each loop rotates to the next sample question. Pause and Replay controls are available; interacting takes over. Playback stops offscreen and in background tabs. Reduced motion shows completed states without automatic playback. Tabs support arrow keys, Home, and End; chart months support Enter and Space. The composer recognizes subscriptions, unusual expenses, and May.
3. **Privacy Shield (`02 / USEFUL PATTERNS: PRIVACY DETAILS`)**: Side-by-side masking and scaling examples, followed by the flow *Your Computer* → *Privacy Shield* → *AI Analysis* → *Your Answer*.
4. **Waitlist Signup**: Existing signup integration.

The walkthrough uses preset fictional figures; it does not parse uploaded files or call an AI service. May's €16,400 earned, €12,110 spent, and €4,290 kept are running totals through May. May alone has €3,106 income and €2,749 spending, including the €1,850 Greece trip. Recording a month toggles a marker for the current page session. The Privacy Shield illustrates the intended product flow.

---

## Technology Stack

The project is built entirely with lightweight, dependency-free web technologies:

- **HTML5**: Semantic markup, accessible roles, ARIA attributes, and SVG graphics.
- **Vanilla CSS**: The custom *Morning Fog* design system utilizing CSS Custom Properties, responsive clamp typography, and CSS Grid/Flexbox layouts.
- **Vanilla JavaScript**: Lightweight controllers for text scrambling, count-up animations, interactive chat simulation, chart toggle states, and form validation.
- **Zero build steps**: No npm packages, bundlers, or frameworks required. Runs directly in any modern browser.

---

## Local Development & Preview

Serve the repository root directory with any standard static web server:

```bash
# Python 3 built-in HTTP server
python3 -m http.server 8000
```

Open `http://localhost:8000` in your browser.

---

## Project Structure

```
├── index.html        # Main landing page markup
├── styles.css        # Morning Fog design system, layout, and component styles
├── script.js         # Interactive walkthrough, chat scenarios, chart toggles, and signup
├── favicon.svg       # Brand favicon
└── README.md         # Project documentation and architectural overview
```

---
Deployment in main for joning the try it now:
https://finance-clarity-tool-watlist.jajootanushri.workers.dev/

Deployment in beta for waitlist:

https://moments-behind-moment-webpage.jajootanushri.workers.dev/


Cloudflare link to dashboard:
https://dash.cloudflare.com/0b97f3548b4c44fa9e561e553c74098e/workers/services/view/moments-behind-moment-webpage/production/builds/dfbda9ba-d7ed-4e94-a620-c2439d6ac036

## Deployment

Deploy `index.html`, `styles.css`, `script.js`, and `favicon.svg` to any static web host (such as Cloudflare Pages, GitHub Pages, Vercel, or Netlify). No server runtime or build script is required.
