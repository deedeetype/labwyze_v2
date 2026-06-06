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

API_KEY = "sk-poe-gvwkqlJlEVhkYoDjJ-nULYN6zf6J7AV4SYgoPyfGWIA"
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

### 4. Choose a filename slug
- Format: `kebab-case-topic-keywords.html`
- Must accurately reflect the actual content (not a clickbait or wrong framing)

### 5. Create the blog post HTML
Follow **exactly** the structure of `/Users/davidlaborieux/Documents/Development/Labwyze/labwyze.com/blog/tesla-terafab-ai-chip-factory.html`:
- Same `<head>` with meta description, keywords, canonical, OG tags, Twitter card, Schema.org Article JSON-LD
- Same navbar, `.blog-post-header` with background image from the generated header
- Same `.blog-post-content` > `.col-md-8.col-md-offset-2` layout
- Opening blockquote (real, sourced quote)
- `<p class="lead">` intro paragraph
- 6–8 `<h3 class="font-alt">` sections with substantive content
- At least 2 `.blog-key-takeaway` blocks
- One `<div class="blog-image">` with the inline header image and a **descriptive alt text** (describe what the image depicts, not just the topic)
- Internal links: naturally embed 2–4 links to other labwyze.com blog posts using `<a href="../blog/OTHER-POST.html">anchor text</a>` within body paragraphs
- Social share block at the bottom
- Same footer and scripts

**SEO checklist before writing:**
- [ ] Primary keyword in `<title>`, meta description, H1, and first paragraph
- [ ] Secondary keywords distributed naturally in H3s and body
- [ ] Canonical URL correct
- [ ] `datePublished` set to today's date
- [ ] Descriptive alt text on all images
- [ ] Internal links to 2–4 related posts

### 6. Update index.html — Latest Blog Posts section
Add a new `<li class="card">` as the **first card** in the `<ul class="cards">` list:
```html
<li class="card">
  <a href="blog/SLUG.html">
    <div class="card-image">
      <img src="blog/SLUG-thumb.jpg" alt="DESCRIPTIVE ALT TEXT"/>
    </div>
    <div class="card-content">
      <h2>TITLE IN UPPERCASE</h2>
      <div class="card-meta">By Labwyze Team | D Mon YYYY</div>
      <p>2–3 sentence summary.</p>
    </div>
  </a>
</li>
```

### 7. Update sitemap.xml
Add a new `<url>` block as the first entry under `<!-- Blog Posts -->`:
```xml
<url>
  <loc>https://labwyze.com/blog/SLUG.html</loc>
  <lastmod>YYYY-MM-DD</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

### 8. Commit and push
```bash
git add blog/SLUG.html blog/SLUG-header.jpg blog/SLUG-thumb.jpg index.html sitemap.xml
git commit -m "feat(blog): Add post — TITLE

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
git push
```

### 9. Report to user
- Title and URL of the new post
- Sources used (with links)
- Internal links added
- Confirmation that everything is pushed
