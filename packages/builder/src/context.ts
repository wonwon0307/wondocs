import { ConfigManager } from "./managers/config";
import { ManifestManager } from "./managers/manifest";
import { UrlManager } from "./managers/urls";

class BuildContext {
  public config: ConfigManager;
  public manifest: ManifestManager;
  public urls: UrlManager;

  constructor() {
    this.config = new ConfigManager();
    this.manifest = new ManifestManager();
    this.urls = new UrlManager();
  }
}

export const builderContext = new BuildContext();
