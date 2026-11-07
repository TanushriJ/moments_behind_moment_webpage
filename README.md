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
2. **Features (`01 / WHAT MAKES THIS DIFFERENT`)**: Local data parsing, privacy transformation, and forward-looking simulations.
3. **Interactive Demo (`02 / SEE IT IN PRACTICE`)**: 3-step walkthrough with drop zone, dynamic chat simulation with dual bar/pie charts, and visual privacy shield scanner.
4. **Privacy Shield (`03 / PRIVACY YOU CAN SEE`)**: Visualizing data flows (*Your Computer* → *Privacy Shield* → *AI Analysis* → *Your Answer*).
5. **How It Works (`04 / A FAMILIAR STARTING POINT`)**: 4-step user journey from statement to understanding.
6. **Waitlist Signup (`05 / TRY IT`)**: Direct waitlist integration.

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
