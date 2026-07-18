export interface Frontmatter {
  title: string;
  description?: string;
}

export type PagesData<T extends Frontmatter> = {
  component: () => Promise<unknown>;
  meta: T;
};
