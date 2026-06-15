# Educational Post Generator

Generate a complete, SEO-optimized **educational** article for labwyze.com that teaches the reader about the topic: **$ARGUMENTS**

This is the same end-to-end pipeline as `/blog-post` (research → internal links → images → slug → JSON-LD → HTML → index card → sitemap → commit/push → LinkedIn post → report), but the article is a **teaching resource**, not a news/opinion piece. The goal is that a reader finishes the article actually understanding the subject: what it is, why it matters, how it works, and how to apply it.

## Steps to follow — in order

### 1. Web Research (mandatory — never skip)
- Use WebSearch to find the 5–8 most authoritative sources on the topic. Prefer primary/foundational and reference-grade sources (official docs, standards bodies, vendor documentation, respected explainers, academic or institutional material). Recent sources are good, but educational content can be evergreen — accuracy and authority matter more than recency.
- Use WebFetch on the top 3 sources to extract verified facts, definitions, mechanisms, numbers, and concrete examples.
- **Never invent or assume facts.** Every definition, claim, number, and example must be traceable to a fetched source. Getting the teaching *correct* is the whole point of an educational piece.
- If the topic is ambiguous or broader/narrower than expected, pick the framing that best serves a reader trying to learn it, and note the chosen scope to the user.

### 2. Research existing blog posts for internal links
Run this to get current blog files:
```bash
ls /Users/davidlaborieux/Documents/Development/Labwyze/labwyze.com/blog/*.html | xargs -I{} basename {}
```
Identify 2–4 posts that are topically related. You will link to them naturally in the body as "further reading" / related concepts.

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

**Educational images are INFOGRAPHICS, not photos.** Unlike `/blog-post` (which uses photorealistic human-subject images), this pipeline produces visuals that actually *teach* — the image should work like a cheatsheet, flowchart, or summary diagram that condenses the article's core learning into one glanceable graphic. The reader should be able to look at the header image and grasp the structure of the concept before reading a word.

- **Header prompt**: a clean, modern **infographic / cheatsheet / diagram**, wide 16:9, that summarizes or maps the topic. Pick the diagram type that best fits the subject, for example:
  - a **flowchart** or process diagram (boxes + arrows) for anything sequential or decision-based;
  - a **labeled cheatsheet / reference card** layout (titled sections, icons, short captions) for concepts, frameworks, or "types of X";
  - a **layered/architecture diagram**, **comparison table**, **timeline**, or **mind map / concept map** when those fit better.
  Use a tidy, professional, flat-vector or clean-editorial style with a clear visual hierarchy, generous spacing, a restrained palette (2–3 accent colors), simple icons, and obvious reading order. It must look like a designer-made explainer graphic, not clip art.
- **Thumb prompt**: a **simplified, bolder** square version of the same idea — a single clean diagram or icon-driven mini-cheatsheet that stays legible at small sizes. Do not cram a dense full cheatsheet into the thumbnail; reduce it to the 3–4 most important boxes/steps/icons.
- **Text inside the image:** short labels are encouraged (they are what makes it a cheatsheet), but AI image generators still garble long or dense text. So keep wording to **a few short words per element** (single words or 2–3 word labels), avoid paragraphs, and lean on structure + icons to carry meaning. After generating, **read the image and check the labels are legible and correctly spelled**; if the text is garbled or nonsensical, regenerate with shorter/fewer labels (or request the key labels explicitly in the prompt). A clean diagram with minimal correct text beats a busy one with gibberish.
- Always specify the topic's actual concepts in the prompt so the diagram reflects the real content (e.g. name the real steps/components/categories the article teaches), not a generic placeholder chart.

**SECURITY — never commit the API key:**
- Write this script to `/tmp` (e.g. `/tmp/gen_img.py`), substitute the real key from memory there, run it, then delete it.
- NEVER save the script (with the key) inside the repo — Netlify's secret scanner will block the deploy, and the key must stay out of git.

**Optimize the images before using them (mandatory — they come out 1.2–1.5 MB):**
```bash
cd /Users/davidlaborieux/Documents/Development/Labwyze/labwyze.com/blog
sips -Z 1600 -s format jpeg -s formatOptions 78 SLUG-header.jpg --out SLUG-header.jpg   # ~300 KB
sips -Z 800  -s format jpeg -s formatOptions 78 SLUG-thumb.jpg  --out SLUG-thumb.jpg    # ~130 KB
```
Confirm both are well under 500 KB before committing. After generating, view each image to confirm it is on-topic and on-brand (professional, not "hacker"/off-brand); regenerate if needed.

### 4. Choose a filename slug
- Format: `kebab-case-topic-keywords.html`
- Must accurately reflect the actual content. For educational pieces, a "what-is" / "guide" / "explained" / "how-..." style slug is often appropriate (e.g. `what-is-retrieval-augmented-generation.html`, `sap-data-migration-explained.html`).

### 5. Generate the JSON-LD schema block

Before writing the HTML, generate the schema. Fill in all values from the research and decisions above. Use `BlogPosting` (same as the blog pipeline) so the site's schema stays consistent:

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
  "datePublished": "YYYY-MM-DDT09:00:00-04:00",
  "dateModified": "YYYY-MM-DDT09:00:00-04:00",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://labwyze.com/blog/SLUG.html"
  },
  "inLanguage": "en",
  "keywords": "COMMA, SEPARATED, FROM, META KEYWORDS TAG",
  "about": {
    "@type": "Thing",
    "name": "PRIMARY TOPIC (the concept being taught)"
  },
  "isPartOf": {
    "@type": "Blog",
    "name": "Labwyze Blog",
    "url": "https://labwyze.com/blog"
  }
}
```

**Optional enhancement (educational only):** if the article is structured as a genuine Q&A explainer, you MAY additionally include a `FAQPage` JSON-LD block with the article's key questions and concise answers (great for SEO rich results). Keep it accurate — only include questions the article actually answers. This is the one allowed addition over the blog pipeline; everything else stays identical.

**Schema rules:**
- `author @type`: use `"Person"` when David Laborieux is the byline, `"Organization"` for Labwyze Team.
- `author url`: use David's LinkedIn URL for Person, `https://labwyze.com` for Organization.
- `headline` must exactly match the `<title>` content (minus ` | Labwyze Blog`).
- `description` must exactly match `<meta name="description">`.
- `datePublished` and `dateModified` = today's date as a **full ISO 8601 datetime with timezone offset**, e.g. `2026-06-15T09:00:00-04:00`. A date alone (`YYYY-MM-DD`) triggers a "missing timezone / invalid datetime" warning in Google's Rich Results test. Labwyze is in Montreal (Eastern): use `-04:00` during EDT (roughly mid-March to early November) and `-05:00` during EST (the rest of the year). Match `<meta property="article:published_time">` to the same value.
- Never leave placeholder values — every field must be filled before inserting.

### 6. Create the educational article HTML
Follow **exactly** the structure of `/Users/davidlaborieux/Documents/Development/Labwyze/labwyze.com/blog/tesla-terafab-ai-chip-factory.html`:
- Same `<head>` with meta description, keywords, canonical, OG tags, Twitter card.
- **REQUIRED — add a social preview image (the reference template is missing these, do not skip):**
  ```html
  <meta property="og:image" content="https://labwyze.com/blog/SLUG-header.jpg" />
  <meta name="twitter:image" content="https://labwyze.com/blog/SLUG-header.jpg" />
  ```
  Keep `twitter:card` set to `summary_large_image`.
- **Insert the JSON-LD schema block(s) from Step 5** as the last item before `</head>`, wrapped in `<script type="application/ld+json">...</script>`.
- Same navbar, `.blog-post-header` with background image from the generated header.
- Same `.blog-post-content` > `.col-md-8.col-md-offset-2` layout.
- Use the educational `blog-post-category` label (e.g. "Guide", "Explainer", "Tutorial", "Fundamentals").

**Educational content structure (this is what differs from /blog-post):** write to teach, in a clear, patient, jargon-aware voice. Include, adapted to the topic:
- Opening blockquote — a real, sourced definition or expert quote that frames the concept.
- `<p class="lead">` intro that states plainly what the reader will understand by the end, and why it matters to them.
- 6–8 `<h3 class="font-alt">` sections that build understanding progressively. A strong default arc:
  1. **What it is** — a plain-language definition (define every key term on first use).
  2. **Why it matters / when you would use it** — the practical motivation.
  3. **How it works** — the mechanism, broken into digestible parts.
  4. **A concrete example or walkthrough** — make it tangible; use a worked example, analogy, or step-by-step.
  5. **Common mistakes / misconceptions** — what trips people up.
  6. **Best practices / how to apply it** — actionable guidance.
  7. **Where it fits in the bigger picture / what to learn next.**
- At least 2 `.blog-key-takeaway` blocks used as "Remember this" callouts.
- Where helpful, use ordered lists (`<ol>`) for steps and a short glossary of key terms. Keep examples accurate and sourced.
- One `<div class="blog-image">` with the inline header image and a **descriptive alt text**.
- Internal links: naturally embed 2–4 links to related labwyze.com posts as related concepts / further reading using `<a href="OTHER-POST.html">anchor text</a>`.
- Social share block at the bottom.
- Same footer and scripts.

**SEO + teaching checklist before writing:**
- [ ] Primary keyword in `<title>`, meta description, H1, and first paragraph
- [ ] Secondary keywords distributed naturally in H3s and body
- [ ] Every key term defined on first use (no unexplained jargon)
- [ ] At least one concrete example, analogy, or worked walkthrough
- [ ] A "common mistakes/misconceptions" section
- [ ] Canonical URL correct
- [ ] `datePublished` set to today's date (full ISO 8601 with timezone)
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
      <p>2–3 sentence summary of what the reader will learn.</p>
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
Batch ALL related changes into ONE commit + ONE push (each push triggers a Netlify rebuild):
```bash
git add blog/SLUG.html blog/SLUG-header.jpg blog/SLUG-thumb.jpg index.html sitemap.xml
git commit -m "feat(blog): Add educational post — TITLE

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
git push
```

### 10. Generate LinkedIn post (copy-paste ready)

Write a LinkedIn post for David to share this article. Rules — apply all of them without exception:

**Tone & voice**
- Personal, first-person: write as if David is sharing something he finds genuinely useful or wishes more people understood about the topic.
- Teaching, generous, not promotional, not corporate, not AI-sounding.
- No em dashes (—), no bullet-point dashes (-), no emojis anywhere.

**Format**
- 3 to 5 paragraphs separated by a blank line.
- Use a plain-line-break list (no dashes) only when listing 3+ items; otherwise integrate into prose.
- Immediately BEFORE the call to action, add one short, genuine discussion question on its own line to invite comments. Keep it specific to the topic.
- End with one short, direct call to action (e.g., "I broke the whole thing down here:") followed by the post URL on its own line.
- 4 to 6 hashtags on the last line, no line break before them.

**Hook (IMPORTANT — David's preferred style, see memory `linkedin-hook-style`):**
- The first line (the part visible before "see more") must be a **provocative, curiosity-sparking hook** that makes the reader want to learn the thing — an intriguing statement on its own line.
- Keep the tone **positive or neutral-curious, never negative/fear-based**. Do NOT threaten the reader (e.g. "you're doing X wrong and it's costing you"). Frame it as something worth understanding, a surprising fact, a common misconception cleared up, or a "most people don't realize..." angle.
- Do NOT address the reader directly with a warning. Keep it about the concept itself.
- Bring a concrete, verified fact or number from the article in early (ideally the second sentence) so the hook is grounded.

**Content**
- Reference at least one concrete fact, number, or example from the article (verified, not invented).
- 1 personal reflection clearly marked as such (e.g., "What finally made it click for me,", "In my experience,").
- Do not repeat the article title verbatim.

Output the LinkedIn text in a clearly delimited block so David can copy-paste it directly.

### 11. Report to user
- Title and URL of the new post
- Sources used (with links)
- Internal links added
- LinkedIn post (copy-paste ready)
- Confirmation that everything is pushed (one commit, one push)
- Reminder to validate schema at https://search.google.com/test/rich-results
