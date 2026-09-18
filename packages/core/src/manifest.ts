import type { DocsFrontmatter, DocsPageData } from "./pages/types";
import type { DocsCrumb, DocsItem } from "./sidebar/types";

type Manifest = {
  pages: { [key: string]: DocsPageData<DocsFrontmatter> };
  sidebar: { [key: string]: DocsItem[] };
  children: { [key: string]: string[] };
  breadcrumbs: { [key: string]: { [url: string]: DocsCrumb[] } };
};

const manifest: Manifest = {
  pages: {},
  sidebar: {},
  children: {},
  breadcrumbs: {},
};

export default manifest;
