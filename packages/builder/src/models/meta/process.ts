import type { DocsItem } from "@wondocs/core/sidebar";

import { builderContext } from "@/context";
import { normalizeUrl } from "@/lib/url";
import { resolveShorthandString } from "./strings";
import { type DocsItemInput } from "./types";

const EXTERNAL_PROTOCOLS = ["http://", "https://", "mailto:", "tel:"];

export function processSidebarItem(
  rawItem: DocsItemInput,
  baseUrl: string,
): DocsItem {
  const { autoDetectExternal } = builderContext.config.getConfig();

  if (typeof rawItem === "string") {
    rawItem = resolveShorthandString(rawItem);
  }

  if (rawItem.type === "link") {
    const startsWithProtocol = EXTERNAL_PROTOCOLS.some((protocol) =>
      rawItem.url.startsWith(protocol),
    );

    // auto detect를 허용하고, 개발자가 external을 명시하지 않으면, external 여부를 자동으로 판단한다
    if (autoDetectExternal && rawItem.external === undefined) {
      rawItem.external = startsWithProtocol;
    }

    if (!startsWithProtocol) {
      const normalizedUrl = normalizeUrl(rawItem.url);
      const url = baseUrl ? `/${baseUrl}${normalizedUrl}` : normalizedUrl;
      rawItem.url = normalizeUrl(url);

      if (rawItem.disabled !== true) {
        builderContext.urls.addMetaUrl(rawItem.url);
      }
    }

    const item: DocsItem = {
      ...rawItem,
      items: rawItem.items?.map((childItem) =>
        processSidebarItem(childItem, baseUrl),
      ),
    };

    return item;
  } else if (rawItem.type === "group") {
    const item: DocsItem = {
      ...rawItem,
      items: rawItem.items?.map((childItem) =>
        processSidebarItem(childItem, baseUrl),
      ),
    };

    return item;
  }

  // separator
  return rawItem;
}
