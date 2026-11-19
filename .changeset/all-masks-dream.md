---
"@wondocs/core": patch
"@wondocs/next-plugin": patch
---

- core: `getSidebar()` and `getBreadcrumbs(url)` now resolve to the project's sole collection when `key` is omitted, instead of looking up an unkeyed `""` group the builder never produces. They throw if the project doesn't have exactly one collection.
- builder: the unlinked-pages build log now reports only the count instead of listing every URL.
- builder: revert writing `.prettierignore` into the output directory; only `.gitignore` is written.
