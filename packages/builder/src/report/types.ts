export type BuildReport = {
  external: number;
  linked: number;
  broken: string[];
  pending: string[];
  unlinked: string[];
};
