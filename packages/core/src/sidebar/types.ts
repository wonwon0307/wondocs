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

export interface DocsCrumb {
  label: string;
  /**
   * Target URL for the crumb. Absent for `group` ancestors (which are not
   * links) and for `disabled` links, so the renderer shows plain text.
   */
  url?: string;
  icon?: string;
  external?: boolean;
  disabled?: boolean;
}
