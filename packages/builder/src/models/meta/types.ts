import type { DocsLink, DocsGroup, DocsSeparator } from "@wondocs/core/sidebar";

type RawLink = Omit<DocsLink, "items"> & {
  items?: (RawDocsItem | string)[];
};

type RawGroup = Omit<DocsGroup, "items"> & {
  items: (RawDocsItem | string)[];
};

type RawDocsItem = RawLink | RawGroup | DocsSeparator;

export type DocsItemInput = RawDocsItem | string;

export type DocsMeta = {
  sidebar: DocsItemInput[];
  baseUrl?: string;
  key?: string;
};
