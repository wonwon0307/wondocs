---
"@wondocs/core": minor
"@wondocs/builder": minor
"@wondocs/next-plugin": minor
---

First stable release of WonDocs.

- `@wondocs/next-plugin`: `createWonDocs()` wraps your Next.js config, builds your docs collections on `next build`, and rebuilds them on change during `next dev`.
- `@wondocs/core`: runtime read API over the generated manifest.
  - `getPage` / `getPageChildren` (`@wondocs/core/pages`): compiled MDX component, frontmatter (`null` when absent) and table of contents for each page.
  - `getSidebar` / `getBreadcrumbs` (`@wondocs/core/sidebar`): sidebar tree and precomputed breadcrumb trails per collection. Omit the key for single-collection projects.
- Collections are configured with `meta.json`: link, group and separator items (with shorthand strings), per-collection `key` and `baseUrl`, and auto-detection of external links.
- Build validation: invalid `meta.json`, duplicate collection keys or base URLs, duplicate page URLs, links to missing pages, and pages not linked in the sidebar fail the build. Set `allowUnlinkedPages` to allow unlinked pages.
- MDX: GitHub-flavored Markdown and heading slugs are on by default. Add your own remark/rehype plugins through the `mdx` option.
