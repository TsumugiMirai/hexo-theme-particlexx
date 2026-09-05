# Changelog

## 1.0.0

Independent continuation of ParticleX's card layout and animated hero.

- Replace whole-page Vue and loading mask with static HTML and modular TypeScript.
- Add responsive hero sources, hashed assets, SVG icons and lazy comment/search code.
- Add Artalk 2.10.0 integration and optional Giscus, stable page IDs and retry states.
- Add dark mode, native dialogs, keyboard navigation, reduced-motion behavior and TOC tracking.
- Add full-text search, Atom feed, sitemap, About and Friends layouts.
- Fix unknown language escaping, clipboard failure handling, mutable post ordering and unlimited pagination.
- Refuse unsafe legacy encrypted posts rather than exposing plaintext summaries or search entries.
- Add real Hexo integration tests, Windows/Linux CI and migration/deployment documentation.

Limitations: legacy password encryption, runtime math, Waline/Twikoo/Gitalk and random backgrounds are not carried forward. See migration documentation.
