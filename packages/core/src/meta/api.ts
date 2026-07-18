import manifest from "#wondocs/sidebar";

export function getSidebar(key?: string) {
  if (key !== undefined) {
    const group = manifest[key];
    if (!group) {
      throw new Error(
        `[WonDocs] No group found for key "${key}". ` +
          `Available groups: ${Object.keys(manifest).join(", ")}`,
      );
    }
    return group;
  }

  const group = manifest[""];
  if (!group) {
    throw new Error(
      `[WonDocs] No single group found. ` +
        `Available groups: ${Object.keys(manifest).join(", ")}`,
    );
  }
  return group;
}
