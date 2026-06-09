# Add Schema to Existing Blog Post

Add or update the JSON-LD BlogPosting schema for an existing blog post: **$ARGUMENTS**

Use this command when a post is missing schema or needs its schema upgraded.

## Steps

### 1. Read the post
```bash
cat /Users/davidlaborieux/Documents/Development/Labwyze/labwyze.com/blog/$ARGUMENTS
```

Extract from the existing HTML:
- `<title>` content (strip " | Labwyze Blog")
- `<meta name="description">` content
- `<meta name="keywords">` content
- `<meta property="article:published_time">` or any date reference in the post body
- The byline (David Laborieux or Labwyze Team)
- The header image filename (from `.blog-post-header` background-image CSS)
- The canonical URL slug

### 2. Generate the schema

Fill in every field — no placeholders:

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "TITLE FROM STEP 1",
  "description": "META DESCRIPTION FROM STEP 1",
  "image": {
    "@type": "ImageObject",
    "url": "https://labwyze.com/blog/HEADER-IMAGE-FROM-STEP-1",
    "width": 1200,
    "height": 630
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
    "@id": "https://labwyze.com/blog/FILENAME"
  },
  "inLanguage": "en",
  "keywords": "FROM META KEYWORDS TAG",
  "about": {
    "@type": "Thing",
    "name": "PRIMARY TOPIC"
  },
  "isPartOf": {
    "@type": "Blog",
    "name": "Labwyze Blog",
    "url": "https://labwyze.com/blog"
  }
}
```

**Author rules:**
- Byline is "David Laborieux" → `@type: "Person"`, url = LinkedIn
- Byline is "Labwyze Team" → `@type: "Organization"`, url = `https://labwyze.com`

### 3. Inject or replace schema in the file

```python
import re

with open('blog/$ARGUMENTS', 'r') as f:
    content = f.read()

schema_block = """  <script type="application/ld+json">
  SCHEMA_JSON_HERE
  </script>"""

# Remove any existing ld+json block
content = re.sub(
    r'\s*<script type="application/ld\+json">.*?</script>',
    '',
    content,
    flags=re.DOTALL
)

# Inject before </head>
content = content.replace('</head>', schema_block + '\n</head>', 1)

with open('blog/$ARGUMENTS', 'w') as f:
    f.write(content)

print("Schema injected successfully")
```

### 4. Commit and push
```bash
git add blog/$ARGUMENTS
git commit -m "seo: Add/upgrade BlogPosting JSON-LD schema — $ARGUMENTS"
git push
```

### 5. Validate
Remind David to test the page at:
https://search.google.com/test/rich-results?url=https://labwyze.com/blog/$ARGUMENTS
