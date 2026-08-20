import type { DocsItem } from "@wondocs/core/sidebar";

// manifest is a map of key to sidebar items
export type SidebarManifest = Record<string, DocsItem[]>;

export type LinkRef = {
  href: string;
  external: boolean;
  disabled: boolean;
};

export type MetaScanResult = {
  prefix: string;
  items: DocsItem[];
  links: LinkRef[]; // flattened refs to every link in the sidebar, for the build report
};
