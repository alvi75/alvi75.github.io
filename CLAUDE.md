# alvi75.github.io

Personal academic website for Zahidul Haque Alvi.

## Tech Stack
- Static HTML site (no build process or templating)
- Bootstrap 4.3.1 + Material Design Bootstrap (MDB)
- jQuery, Masonry (card grid layout), Highlight.js (code blocks), MathJax
- Fonts: Roboto, Roboto Slab, Source Code Pro, FontAwesome, Academicons

## Structure
- `index.html` — Home/About page (has contact icons in navbar instead of brand name)
- `cv/index.html` — CV page
- `projects/index.html` — Projects with card grid (Masonry layout)
- `publications/index.html` — Publications with abstract/bibtex toggles
- `teaching/index.html` — Teaching experience
- `blog/index.html` — Blog listing (loads posts from `/blog.json`)
- `blog/*.html` — Individual blog post pages
- `assets/` — CSS, JS, fonts, images

## Key Conventions
- Navigation is duplicated inline in every page (not shared/templated) — must update ALL pages when adding/removing nav items
- Nav order: About, CV, Projects, Publications, Teaching, Blog
- Active page gets `navbar-active font-weight-bold` class on its `<li>`
- Home page navbar has contact icons instead of brand name; all other pages have "Zahidul Haque" brand
- All content is hardcoded HTML; blog listing is the only page that loads data from JSON (`blog.json`)
- Dark theme: background `#0a0a0a`→`#1a1a1a`, accent `#fbbf24` (amber), cards `rgba(30,30,30,0.6)`
- Card style: `border-radius: 4px`, hover `translateY(-4px)` + `box-shadow: 0 8px 20px rgba(0,0,0,0.4)`
- Blog post pages use serif reading font (Georgia), callout boxes (insight/warning/detail/critical), syntax-highlighted code blocks

## Commands
- Local dev: `python -m http.server 8080` from repo root, then visit `http://localhost:8080/`
- Deploy: push to `main` — GitHub Pages auto-deploys
