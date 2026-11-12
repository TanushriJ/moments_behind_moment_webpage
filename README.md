# Moments Behind Money

> **Know where your money goes. Understand what it means.**

A privacy-first clarity layer between your bank and your financial decisions.

---

## Page Architecture & Layout

1. **Hero Section**:
   - The original headline and full supporting paragraph, followed by the three-part *Where we fit in* panel: *Your bank statement → Your financial clarity → Your decisions*.
   - “Why did I spend more this month?” appears as a user message inside the first scrollable chat. Its card extends to the left column's action buttons, with no extra header. The assistant's plain reply explains the couch's 90% share of the increase above a separate card listing fixed and variable cost totals, their components, and a €1,250 couch purchase. One chart compares the increases from last month (€40 + €100 + €1,250 = €1,390). Three clickable follow-ups cover what changed, which bills increased, and everyday costs. Both chats use the same Lora family as Your story, with 14px response text and larger questions and figures. A slow reading scroll reveals overflow and stops when the visitor scrolls or touches the thread. Explore prose and rows appear at a slower pace, with the final reading pause following the scroll. This illustrative comparison is separate from the walkthrough's dated transactions. Both chats show the assistant symbol without a name; Explore uses “Finding a response…” with dots while loading. The hero question types and the answer fades in once when visible; interaction reveals it immediately, and reduced motion shows completed content without automatic scrolling. It never loops.
   - On beta, both primary links say “Join the waitlist” and lead to the signup section (`#join`); the quieter link opens the live walkthrough.
2. **Interactive Demo (`01 / SEE IT IN PRACTICE`)**: All three steps share the upload's 480px frame. The CSV arrives, transaction rows appear and are categorized, then the cumulative chart draws and a preview cursor clicks April to reveal its story. Upload animations run at half speed; the cursor reaches April sooner, followed by a 6.5-second reading pause. The chat types and sends a sample question, shows a thinking indicator, streams the answer, and holds it for 12 seconds. The unusual-expenses answer has no chart; May's breakdown uses vertical bars, with a pie view available. Each loop rotates to the next sample question. Clicking Upload restarts the full walkthrough; other interactions take over. Playback stops offscreen and in background tabs. Reduced motion shows completed states without automatic playback. Tabs support arrow keys, Home, and End; chart months support Enter and Space. The composer recognizes subscriptions, unusual expenses, and May.
3. **Privacy Shield (`02 / USEFUL PATTERNS: PRIVACY DETAILS`)**: Side-by-side masking and scaling examples, followed by the flow *Your statement* → *Privacy Shield* → *AI Analysis* → *Your Answer*. The file-stays-local explanation appears once in the details beneath the visual.
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
