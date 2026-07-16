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

export interface DocsGroup {
  prefix?: string; // if not given in meta.json, the prefix will be the same as the key
  items: Item[];
}
