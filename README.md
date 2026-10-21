# Moments Behind Money webpage

A responsive starting page using the budget app's Morning Fog palette, Inter/Lora/DM Mono fonts, forest-green charts, clay buttons, and card styling.

The site is plain HTML, CSS, and JavaScript, with no build step or runtime framework dependency.

## Preview

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Visit `http://127.0.0.1:4173/`. Existing `/#join` links scroll to the waitlist form.

## What visitors can explore

- Six months of illustrative income and spending, with a selectable monthly story and accessible data table.
- A savings scenario with adjustable monthly contributions, a comparison line, target, and explicit assumptions.
- Original versus filtered views of a fictional sensitive transaction, with a description of the privacy layer's scope.
- Monthly stories, chat, correction learning, and the statement-upload workflow.

Every graph and transaction example is fictional. Demonstrations run in the visitor's browser without uploading their inputs or modifying app data.

## Signup

The form retains the original Google Apps Script destination and sends the same `{ name, email }` JSON payload as a `text/plain` POST with `mode: 'no-cors'`. The endpoint is configured in `script.js`.

The form includes labels, inline validation, a submission state, and a retry message for network failures. An opaque response cannot confirm server-side storage, so the status says the request was sent rather than guaranteeing registration.

No real signup was submitted during local verification. Check the existing service and its records separately when validating a live deployment.

## Hosting

Publish `index.html`, `styles.css`, `script.js`, and `favicon.svg` together as static files. There is no backend or dependency-installation step in this repository. The existing Cloudflare project's build/deployment configuration and public URL must be checked separately; this change does not change those settings.

The page retains the existing Google Fonts dependency. Google Apps Script is contacted only when the visitor submits the signup form.
