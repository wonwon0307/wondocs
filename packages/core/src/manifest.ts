import type { DocsFrontmatter, DocsPageData } from "./pages/types";
import type { DocsItem } from "./sidebar/types";

type Manifest = {
  pages: { [key: string]: DocsPageData<DocsFrontmatter> };
  sidebar: { [key: string]: DocsItem[] };
};

const manifest: Manifest = {
  pages: {},
  sidebar: {},
};

export default manifest;
