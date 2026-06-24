# Playbook Posting

Integrate a new lead-magnet playbook (PDF) into labwyze.com as a gated download: **$ARGUMENTS**

If $ARGUMENTS is empty, look for a PDF the user just dropped into `/Users/davidlaborieux/Documents/Development/Labwyze/labwyze.com/downloads/` (check file timestamps) and confirm the filename with the user before proceeding.

## Steps to follow — in order

### 1. Read the actual PDF content (mandatory — never invent the pitch)
Install poppler once if missing, then extract real text:
```bash
which pdftotext || brew install poppler
pdftotext -layout "/Users/davidlaborieux/Documents/Development/Labwyze/labwyze.com/downloads/ORIGINAL_FILENAME.pdf" -
```
Read the table of contents, executive summary, and any stats/figures. The landing page's title, subtitle, and "What's inside" bullets must be grounded in what the document actually says — never invented boilerplate. Pull 5–6 concrete bullets tied to real section headings or stats from the PDF.

### 2. Pick a slug and rename the PDF
- Format: `kebab-case-name.pdf` (no spaces, no original messy filename)
```bash
cd /Users/davidlaborieux/Documents/Development/Labwyze/labwyze.com
git mv "downloads/ORIGINAL_FILENAME.pdf" "downloads/SLUG.pdf" 2>/dev/null || mv "downloads/ORIGINAL_FILENAME.pdf" "downloads/SLUG.pdf"
```

### 3. Create the landing page — `playbook-SLUG.html`
Copy the structure **exactly** from an existing playbook page (e.g. `playbook-s4hana-migration.html` or `playbook-finance-ai-readiness.html`) and change only:
- `<title>`, meta description
- Hero `<h1 class="module-title font-alt">` and `.module-subtitle` (do **not** add `mb-0` to this h1 — see CSS gotcha below)
- The "What's inside" `<ul class="pb-benefits">` bullets (from Step 1's real content)
- The `<form name="playbook-SLUG" ... action="/playbook-SLUG-merci.html">`, including:
  - `<input type="hidden" name="form-name" value="playbook-SLUG">`
  - `<input type="hidden" name="asset" value="Title Case Playbook Name">`
- Keep the same nav (with `resources.html` marked `active`), footer, and script tags untouched

### 4. Create the thank-you page — `playbook-SLUG-merci.html`
Copy from an existing `playbook-*-merci.html` and change only:
- `<title>`, meta description, `<meta name="robots" content="noindex, nofollow">` stays
- The headline/subtitle text
- The download link: `<a href="downloads/SLUG.pdf" download class="btn btn-lg btn-round btn-w">`
- The two links under the button (Resources hub + a relevant contact CTA)

### 5. Generate the resource card image via nano-banana-pro
Retrieve the Poe API key from memory (`poe-api-key.md`). **Security — never expose the key in a Bash command line or hardcode it in a script saved to the repo:**
```bash
echo 'KEY_FROM_MEMORY' > /tmp/.poe_key   # do this with the Write tool, not by echoing in Bash
```
Then write `/tmp/gen_SLUG_card_img.py`:
```python
import asyncio, fastapi_poe as fp, httpx

API_KEY = open("/tmp/.poe_key").read().strip()
BOT = "nano-banana-pro"

PROMPT = (
    "Square professional editorial photo for a B2B consulting card thumbnail. "
    "DESCRIBE: a human subject (consultant/executive relevant to the topic) interacting with "
    "concrete visual symbols of the playbook's subject — not abstract glowing lines. "
    "Corporate photography style, shallow depth of field, navy blue and white color palette, "
    "high quality, realistic, no text, no logos, no readable UI labels."
)

async def generate_image(prompt, out_path):
    message = fp.ProtocolMessage(role="user", content=prompt)
    last_url = None
    async for partial in fp.get_bot_response(messages=[message], bot_name=BOT, api_key=API_KEY):
        att = getattr(partial, "attachment", None)
        if att is not None and getattr(att, "url", None):
            last_url = att.url
    if not last_url:
        print("NO IMAGE URL found")
        return
    async with httpx.AsyncClient(timeout=90) as client:
        r = await client.get(last_url)
        open(out_path, 'wb').write(r.content)
    print(f"Saved: {out_path}")

asyncio.run(generate_image(PROMPT, "/tmp/SLUG-card.jpg"))
```
**Important:** capture the image URL from `partial.attachment.url` during streaming — nano-banana-pro does NOT reliably return an inline `![alt](url)` markdown link; it often returns a reference-style link (`![alt][ref]`) with the real URL only available via the `attachment` field on the streamed chunk. Do not rely on regex-parsing the text.

Run it, review the result with the Read tool before using it, then place and compress:
```bash
cp /tmp/SLUG-card.jpg /Users/davidlaborieux/Documents/Development/Labwyze/labwyze.com/assets/images/resources/SLUG-card.jpg
cd /Users/davidlaborieux/Documents/Development/Labwyze/labwyze.com/assets/images/resources
sips -Z 800 -s format jpeg -s formatOptions 78 SLUG-card.jpg --out SLUG-card.jpg
```
Then delete the temp script and key immediately:
```bash
rm -f /tmp/gen_SLUG_card_img.py /tmp/.poe_key /tmp/SLUG-card.jpg
```

### 6. Add the card to `resources.html`
Insert a new card block (copy an existing one in the `<!-- Add new resources by copying the block above -->` spot):
```html
<div class="col-md-4 col-sm-6">
  <div class="resource-card">
    <div class="resource-card-top">
      <span class="resource-card-tag">Playbook · PDF</span>
      <img src="assets/images/resources/SLUG-card.jpg" alt="TITLE" loading="lazy">
    </div>
    <div class="resource-card-body">
      <h3 class="font-alt">TITLE</h3>
      <p>1–2 sentence description grounded in the real content.</p>
      <a href="playbook-SLUG.html" class="btn btn-round btn-d">Get the playbook</a>
    </div>
  </div>
</div>
```
The `.resource-card*` CSS already exists in `resources.html`'s `<style>` block — do not duplicate it.

### 7. Update `sitemap.xml`
Bump `resources.html`'s `<lastmod>` to today, and add a new `<url>` entry for `playbook-SLUG.html` under the `<!-- Resources -->` section (monthly changefreq, priority 0.8).

### 8. CSS gotcha — do not reintroduce this bug
`.module-title + .module-subtitle { margin-top: -35px; }` assumes the title keeps its default 70px bottom margin. If you add `mb-0` to a page-header `<h1 class="module-title">` that's immediately followed by a `.module-subtitle`, the subtitle overlaps the title. Never add `mb-0` on a page-header h1 that has a subtitle beneath it.

### 9. Nav check
The "Resources" nav link is already global (index.html, about.html, portfolio.html, and every playbook/resources page). No nav changes needed for additional playbooks — only the card in Step 6.

### 10. Commit and push
```bash
git add resources.html sitemap.xml downloads/SLUG.pdf playbook-SLUG.html playbook-SLUG-merci.html assets/images/resources/SLUG-card.jpg
git commit -m "Add TITLE lead magnet" -m "- New gated landing page + thank-you page for TITLE
- New card on resources.html with nano-banana-pro generated image
- Register new pages in sitemap

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
git push
```
Confirm with the user before pushing if this is the first push of the session.

### 11. Report to user
- Landing page URL and thank-you page URL
- Reminder: Netlify Forms will auto-detect the new form name (`playbook-SLUG`) after deploy — go to Netlify → Forms → Settings & usage → Form notifications and add an email notification for it (each playbook has its own separate form).
