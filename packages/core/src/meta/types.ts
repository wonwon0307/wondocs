export interface Link {
  type: "link";
  href: string;
  label?: string;
  icon?: string;
  badge?: string;
  external?: boolean;
  disabled?: boolean;
  items?: Item[];
  defaultOpen?: boolean;
}

export interface Group {
  type: "group";
  label: string;
  icon?: string;
  badge?: string;
  items: Item[];
  defaultOpen?: boolean;
}

export interface Separator {
  type: "separator";
  label?: string;
  icon?: string;
}

export type Item = Link | Group | Separator;

// manifest is a map of key to sidebar items
export type SidebarManifest = Record<string, Item[]>;

export type MetaScanResult = {
  prefix: string;
  items: Item[];
  hrefs: Set<string>; // collection of all hrefs in the sidebar
};
