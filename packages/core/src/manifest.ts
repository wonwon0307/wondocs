import type { DocsFrontmatter, DocsPageData } from "./pages/types";
import type { DocsItem } from "./sidebar/types";

type Manifest = {
  pages: { [key: string]: DocsPageData<DocsFrontmatter> };
  sidebar: { [key: string]: DocsItem[] };
  children: { [key: string]: string[] };
};

const manifest: Manifest = {
  pages: {},
  sidebar: {},
  children: {},
};

export default manifest;
