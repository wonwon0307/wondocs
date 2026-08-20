export interface DocsLink {
  type: "link";
  href: string;
  label?: string;
  icon?: string;
  badge?: string;
  external?: boolean;
  disabled?: boolean;
  items?: DocsItem[];
  defaultOpen?: boolean;
}

export interface DocsGroup {
  type: "group";
  label: string;
  icon?: string;
  badge?: string;
  items: DocsItem[];
  defaultOpen?: boolean;
}

export interface DocsSeparator {
  type: "separator";
  label?: string;
  icon?: string;
}

export type DocsItem = DocsLink | DocsGroup | DocsSeparator;
