export class EmptyCollectionError extends Error {
  public dir: string;

  constructor(dir: string) {
    super("Empty Collection: " + dir);
    this.name = "EmptyCollectionError";
    this.dir = dir;
  }
}

export class EmptyPagesDirError extends Error {
  public dir: string;

  constructor(dir: string) {
    super("Empty Pages Directory: " + dir);
    this.name = "EmptyPagesDirError";
    this.dir = dir;
  }
}
export class MissingMetaJsonError extends Error {
  public dir: string;

  constructor(dir: string) {
    super("Missing meta.json in collection: " + dir);
    this.name = "MissingMetaJsonError";
    this.dir = dir;
  }
}
