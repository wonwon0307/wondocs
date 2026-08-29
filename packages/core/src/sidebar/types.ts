export interface DocsLink {
  type: "link";
  url: string;
  label: string;
  icon?: string;
  right?: string | number;
  external?: boolean;
  disabled?: boolean;
  items?: DocsItem[];
  defaultOpen?: boolean;
}

export interface DocsGroup {
  type: "group";
  label: string;
  icon?: string;
  items: DocsItem[];
  defaultOpen?: boolean;
}

export interface DocsSeparator {
  type: "separator";
  label?: string;
}

export type DocsItem = DocsLink | DocsGroup | DocsSeparator;
