# Blog Post Generator

Generate a complete, SEO-optimized blog post for labwyze.com on the topic: **$ARGUMENTS**

## Steps to follow — in order

### 1. Web Research (mandatory — never skip)
- Use WebSearch to find the 5–8 most recent and authoritative sources on the topic (include year 2026 in queries)
- Use WebFetch on the top 3 sources to extract verified facts, quotes, dates, numbers
- **Never invent or assume facts.** Every claim must be traceable to a fetched source.
- Note: if the topic turns out to be different from what the user described (e.g., investment vs. acquisition), correct the framing accordingly and inform the user.

### 2. Research existing blog posts for internal links
Run this to get current blog files:
```bash
ls /Users/davidlaborieux/Documents/Development/Labwyze/labwyze.com/blog/*.html | xargs -I{} basename {}
```
Identify 2–4 posts that are topically related to this new post. You will link to them naturally in the body text.

### 3. Generate images via Poe API (nano-banana-pro)
Use this Python script template (fill in prompts):

```python
import asyncio, fastapi_poe as fp, httpx

API_KEY = "RETRIEVE_FROM_MEMORY"  # stored in Claude memory: project/poe-api-key.md
BOT = "nano-banana-pro"

async def generate_image(prompt, out_path):
    message = fp.ProtocolMessage(role="user", content=prompt)
    url = None
    async for partial in fp.get_bot_response(messages=[message], bot_name=BOT, api_key=API_KEY):
        if hasattr(partial, 'attachment') and partial.attachment:
            url = partial.attachment.url
    if url:
        async with httpx.AsyncClient(timeout=60) as client:
            r = await client.get(url)
            open(out_path, 'wb').write(r.content)
        print(f"Saved: {out_path}")

async def main():
    base = "/Users/davidlaborieux/Documents/Development/Labwyze/labwyze.com/blog"
    await generate_image(HEADER_PROMPT, f"{base}/SLUG-header.jpg")
    await generate_image(THUMB_PROMPT, f"{base}/SLUG-thumb.jpg")

asyncio.run(main())
```

- **Header prompt**: cinematic, wide 16:9, photorealistic, no text overlays, relevant to the topic
- **Thumb prompt**: square, abstract/iconic composition, bold colors, no text

**SECURITY — never commit the API key:**
- Write this script to `/tmp` (e.g. `/tmp/gen_img.py`), substitute the real key from memory there, run it, then delete it.
- NEVER save the script (with the key) inside the repo — Netlify's secret scanner will block the deploy, and the key must stay out of git.

**Optimize the images before using them (mandatory — they come out 1.2–1.5 MB):**
Raw Poe output is far too heavy and will wreck Core Web Vitals (LCP). Compress in place right after generating:
```bash
cd /Users/davidlaborieux/Documents/Development/Labwyze/labwyze.com/blog
sips -Z 1600 -s format jpeg -s formatOptions 78 SLUG-header.jpg --out SLUG-header.jpg   # ~300 KB
sips -Z 800  -s format jpeg -s formatOptions 78 SLUG-thumb.jpg  --out SLUG-thumb.jpg    # ~130 KB
```
Confirm both are well under 500 KB before committing.

### 4. Choose a filename slug
- Format: `kebab-case-topic-keywords.html`
- Must accurately reflect the actual content (not a clickbait or wrong framing)

### 5. Generate the JSON-LD schema block

Before writing the HTML, generate the BlogPosting schema. Fill in all values from the research and decisions above:

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "EXACT TITLE (matches <title> tag minus ' | Labwyze Blog')",
  "description": "EXACT META DESCRIPTION (copy verbatim from <meta name=description>, whatever its length)",
  "image": {
    "@type": "ImageObject",
    "url": "https://labwyze.com/blog/SLUG-header.jpg",
    "width": 1600,
    "height": 893
  },
  "author": {
    "@type": "PERSON_OR_ORGANIZATION",
    "name": "David Laborieux OR Labwyze Team",
    "url": "https://www.linkedin.com/in/david-laborieux-a1864214/ OR https://labwyze.com"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Labwyze",
    "url": "https://labwyze.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://labwyze.com/assets/images/favicons/final_logo.png",
      "width": 512,
      "height": 512
    }
  },
  "datePublished": "YYYY-MM-DD",
  "dateModified": "YYYY-MM-DD",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://labwyze.com/blog/SLUG.html"
  },
  "inLanguage": "en",
  "keywords": "COMMA, SEPARATED, FROM, META KEYWORDS TAG",
  "about": {
    "@type": "Thing",
    "name": "PRIMARY TOPIC (e.g. SAP Joule, AI agents, digital transformation)"
  },
  "isPartOf": {
    "@type": "Blog",
    "name": "Labwyze Blog",
    "url": "https://labwyze.com/blog"
  }
}
```

**Schema rules:**
- `author @type`: use `"Person"` when David Laborieux is the byline, `"Organization"` for Labwyze Team
- `author url`: use David's LinkedIn URL for Person, `https://labwyze.com` for Organization
- `headline` must exactly match the `<title>` content (minus ` | Labwyze Blog`)
- `description` must exactly match `<meta name="description">`
- `datePublished` and `dateModified` = today's date in YYYY-MM-DD format
- Never leave placeholder values — every field must be filled before inserting

### 6. Create the blog post HTML
Follow **exactly** the structure of `/Users/davidlaborieux/Documents/Development/Labwyze/labwyze.com/blog/tesla-terafab-ai-chip-factory.html`:
- Same `<head>` with meta description, keywords, canonical, OG tags, Twitter card
- **REQUIRED — add a social preview image (the reference template is missing these, do not skip):**
  ```html
  <meta property="og:image" content="https://labwyze.com/blog/SLUG-header.jpg" />
  <meta name="twitter:image" content="https://labwyze.com/blog/SLUG-header.jpg" />
  ```
  Without `og:image`, LinkedIn/X/Facebook shares have no reliable preview thumbnail — and this pipeline exists to drive LinkedIn traffic, so this is non-negotiable. Keep `twitter:card` set to `summary_large_image`.
- **Insert the JSON-LD schema block from Step 5** as the last item before `</head>`, wrapped in `<script type="application/ld+json">...</script>`
- Same navbar, `.blog-post-header` with background image from the generated header
- Same `.blog-post-content` > `.col-md-8.col-md-offset-2` layout
- Opening blockquote (real, sourced quote)
- `<p class="lead">` intro paragraph
- 6–8 `<h3 class="font-alt">` sections with substantive content
- At least 2 `.blog-key-takeaway` blocks
- One `<div class="blog-image">` with the inline header image and a **descriptive alt text**
- Internal links: naturally embed 2–4 links to other labwyze.com blog posts using `<a href="OTHER-POST.html">anchor text</a>` within body paragraphs
- Social share block at the bottom
- Same footer and scripts

**SEO checklist before writing:**
- [ ] Primary keyword in `<title>`, meta description, H1, and first paragraph
- [ ] Secondary keywords distributed naturally in H3s and body
- [ ] Canonical URL correct
- [ ] `datePublished` set to today's date
- [ ] Descriptive alt text on all images
- [ ] Internal links to 2–4 related posts
- [ ] JSON-LD schema block present and complete (no placeholder values)
- [ ] `og:image` and `twitter:image` present, pointing to SLUG-header.jpg
- [ ] Header and thumb images optimized (each well under 500 KB)

### 7. Update index.html — Latest Blog Posts section
Add a new `<li class="card">` as the **first card** in the `<ul class="cards">` list:
```html
<li class="card">
  <a href="blog/SLUG.html">
    <div class="card-image">
      <img loading="lazy" decoding="async" src="blog/SLUG-thumb.jpg" alt="DESCRIPTIVE ALT TEXT"/>
    </div>
    <div class="card-content">
      <h2>TITLE IN UPPERCASE</h2>
      <div class="card-meta">By Labwyze Team | D Mon YYYY</div>
      <p>2–3 sentence summary.</p>
    </div>
  </a>
</li>
```

### 8. Update sitemap.xml
Add a new `<url>` block as the first entry under `<!-- Blog Posts -->`:
```xml
<url>
  <loc>https://labwyze.com/blog/SLUG.html</loc>
  <lastmod>YYYY-MM-DD</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

### 9. Commit and push
```bash
git add blog/SLUG.html blog/SLUG-header.jpg blog/SLUG-thumb.jpg index.html sitemap.xml
git commit -m "feat(blog): Add post — TITLE

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
git push
```

### 10. Generate LinkedIn post (copy-paste ready)

Write a LinkedIn post for David to share this article. Rules — apply all of them without exception:

**Tone & voice**
- Personal, first-person: write as if David is sharing his own experience, perspective, or observation related to the topic
- Not promotional, not corporate, not AI-sounding
- No em dashes (—), no bullet-point dashes (-), no emojis anywhere

**Format**
- 3 to 5 paragraphs separated by a blank line
- Use bullet points (without dashes — use a plain line break and indent) only when listing 3+ items; otherwise integrate into prose
- Immediately BEFORE the call to action, add one short, genuine discussion question on its own line to invite comments (e.g., "Curious how others are seeing this play out. Are you...?"). Keep it specific to the topic, not generic.
- End with one short, direct call to action (e.g., "Read the full analysis here:") followed by the post URL on its own line
- 4 to 6 hashtags on the last line, no line break before them

**Content**
- Hook in the first sentence: lead with a concrete, verified number or fact from the article (e.g., a dollar figure, percentage, date, or benchmark), framed in a surprising or counterintuitive way. The number must come early, not buried in a later paragraph.
- Reference at least one additional concrete fact or number from the article (verified, not invented)
- 1 personal reflection or opinion clearly marked as such (e.g., "In my view,", "What struck me most,")
- Do not repeat the article title verbatim

> EXPERIMENTAL (added 2026-06-09, based on LinkedIn analytics): the "number-first hook"
> and "discussion question before the CTA" rules are a test. The data showed top-reach
> posts led with a hard number, and the only high-comment post invited discussion.
> Evaluate after the next few posts; if engagement does not improve, revert these two
> rules to the prior version (hook = "surprising/personal/counterintuitive", single CTA
> with no question). These rules apply to the LinkedIn post ONLY, never the blog article.

Output the LinkedIn text in a clearly delimited block so David can copy-paste it directly.

### 11. Report to user
- Title and URL of the new post
- Sources used (with links)
- Internal links added
- LinkedIn post (copy-paste ready)
- Confirmation that everything is pushed
- Reminder to validate schema at https://search.google.com/test/rich-results
