# @wondocs/core

## 0.1.0

### Minor Changes

- [#74](https://github.com/wonwon0307/wondocs/pull/74) [`dcd5be7`](https://github.com/wonwon0307/wondocs/commit/dcd5be7abf5f62255a8cb8c2bbf17bb1dec489fc) Thanks [@wonwon0307](https://github.com/wonwon0307)! - First stable release of WonDocs.

  - `@wondocs/next-plugin`: `createWonDocs()` wraps your Next.js config, builds your docs collections on `next build`, and rebuilds them on change during `next dev`.
  - `@wondocs/core`: runtime read API over the generated manifest.
    - `getPage` / `getPageChildren` (`@wondocs/core/pages`): compiled MDX component, frontmatter (`null` when absent) and table of contents for each page.
    - `getSidebar` / `getBreadcrumbs` (`@wondocs/core/sidebar`): sidebar tree and precomputed breadcrumb trails per collection. Omit the key for single-collection projects.
  - Collections are configured with `meta.json`: link, group and separator items (with shorthand strings), per-collection `key` and `baseUrl`, and auto-detection of external links.
  - Build validation: invalid `meta.json`, duplicate collection keys or base URLs, duplicate page URLs, links to missing pages, and pages not linked in the sidebar fail the build. Set `allowUnlinkedPages` to allow unlinked pages.
  - MDX: GitHub-flavored Markdown and heading slugs are on by default. Add your own remark/rehype plugins through the `mdx` option.

## 0.1.0-beta.12

### Patch Changes

- [#71](https://github.com/wonwon0307/wondocs/pull/71) [`413176d`](https://github.com/wonwon0307/wondocs/commit/413176d976432fe2f0d49ac94d946bf4eabb2ee3) Thanks [@wonwon0307](https://github.com/wonwon0307)! - - core: `getSidebar()` and `getBreadcrumbs(url)` now resolve to the project's sole collection when `key` is omitted, instead of looking up an unkeyed `""` group the builder never produces. They throw if the project doesn't have exactly one collection.
  - builder: the unlinked-pages build log now reports only the count instead of listing every URL.
  - builder: revert writing `.prettierignore` into the output directory; only `.gitignore` is written.

## 0.1.0-beta.11

### Patch Changes

- [#68](https://github.com/wonwon0307/wondocs/pull/68) [`1686e5c`](https://github.com/wonwon0307/wondocs/commit/1686e5c9375c3e33a53a5fe9fee6913439591291) Thanks [@wonwon0307](https://github.com/wonwon0307)! - write prettier ignore in outdir

## 0.1.0-beta.10

### Patch Changes

- [#64](https://github.com/wonwon0307/wondocs/pull/64) [`28132ea`](https://github.com/wonwon0307/wondocs/commit/28132eae3933d618cd251ff5bb236ccaa185125c) Thanks [@wonwon0307](https://github.com/wonwon0307)! - Save meta as null when frontmatter is not given

## 0.1.0-beta.9

### Patch Changes

- [#62](https://github.com/wonwon0307/wondocs/pull/62) [`bb05caf`](https://github.com/wonwon0307/wondocs/commit/bb05caf27852f95d28b21f81a63d13c0781f0be9) Thanks [@wonwon0307](https://github.com/wonwon0307)! - Rename and export the MDX Module type

## 0.1.0-beta.8

### Patch Changes

- [#60](https://github.com/wonwon0307/wondocs/pull/60) [`c67c1db`](https://github.com/wonwon0307/wondocs/commit/c67c1db236489b3877dc76861e3c51e608ac87ea) Thanks [@wonwon0307](https://github.com/wonwon0307)! - Add children and breadcrumbs to manifest

## 0.1.0-beta.7

### Patch Changes

- [#56](https://github.com/wonwon0307/wondocs/pull/56) [`126989b`](https://github.com/wonwon0307/wondocs/commit/126989b9b0e15972f951fc8801ae21e0ca8ea52d) Thanks [@wonwon0307](https://github.com/wonwon0307)! - Add Gfm plugin by default

## 0.1.0-beta.6

### Patch Changes

- [#54](https://github.com/wonwon0307/wondocs/pull/54) [`f31e7db`](https://github.com/wonwon0307/wondocs/commit/f31e7db97ef33fa9d3d47668e4ae54dc06ec842c) Thanks [@wonwon0307](https://github.com/wonwon0307)! - Add component return type

## 0.1.0-beta.5

### Patch Changes

- [#52](https://github.com/wonwon0307/wondocs/pull/52) [`c7eea88`](https://github.com/wonwon0307/wondocs/commit/c7eea8877de7123d12428af5801067e206f87302) Thanks [@wonwon0307](https://github.com/wonwon0307)! - Make title field optional in DocsFrontmatter and export DocsTocEntry type

## 0.1.0-beta.4

### Patch Changes

- [#50](https://github.com/wonwon0307/wondocs/pull/50) [`94265cc`](https://github.com/wonwon0307/wondocs/commit/94265cc924e54962fe43611d5fa4acf4964feee4) Thanks [@wonwon0307](https://github.com/wonwon0307)! - Rework builder, and add TOC support

## 0.1.0-beta.3

### Patch Changes

- [#39](https://github.com/wonwon0307/wondocs/pull/39) [`22bd1f8`](https://github.com/wonwon0307/wondocs/commit/22bd1f87b66821847e898bd240b1e0715db124bd) Thanks [@wonwon0307](https://github.com/wonwon0307)! - Bugfix: add leading-slash to fix misleading link bugs and also process children links of another parent link as well

## 0.1.0-beta.2

### Patch Changes

- [#37](https://github.com/wonwon0307/wondocs/pull/37) [`dbce64a`](https://github.com/wonwon0307/wondocs/commit/dbce64a90c3f66f3257cd98ec22bb53bd589b9f2) Thanks [@wonwon0307](https://github.com/wonwon0307)! - Define types for exported modules

## 0.1.0-beta.1

### Patch Changes

- [#34](https://github.com/wonwon0307/wondocs/pull/34) [`642aef5`](https://github.com/wonwon0307/wondocs/commit/642aef5a6f211218a40b09e75681bbcd2620f170) Thanks [@wonwon0307](https://github.com/wonwon0307)! - Fix plugin path resolution, core build manifest resolution timing and alias handling and add scaffolding in initial watch.

## 0.1.0-beta.0

### Minor Changes

- [#18](https://github.com/wonwon0307/wondocs/pull/18) [`9073540`](https://github.com/wonwon0307/wondocs/commit/90735401820b648f6ea2ff541b234d6e3c6e9cd2) Thanks [@wonwon0307](https://github.com/wonwon0307)! - Initial pre-release of the WonDocs core and next-plugin packages.
