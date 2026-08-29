import type { DocsItem, DocsLink, DocsSeparator } from "@wondocs/core/sidebar";

export function resolveShorthandString(inlineStr: string): DocsItem {
  const trimmedStr = inlineStr.trim();

  if (trimmedStr.startsWith("---")) {
    return parseSeparatorStr(trimmedStr);
  }

  return parseLinkString(trimmedStr);
}

// "---" 단독, 또는 "---Label---" 형식
const SEPARATOR_PATTERN = /^---$|^---(.+)---$/;

function parseSeparatorStr(str: string): DocsSeparator {
  const match = str.match(SEPARATOR_PATTERN);

  if (!match) {
    throw new Error(`Invalid shorthand string: "${str}".`);
  }

  const [, labelOnly] = match;
  const label = labelOnly?.trim() || undefined;

  return {
    type: "separator",
    ...(label && { label }),
  };
}

// "[Label](url)" 또는 "[IconName][Label](url)" 형식. 맨 앞에 "!"(disabled)를 붙일 수 있다.
// 첫 대괄호 그룹은 필수(아이콘 또는 라벨), 두 번째 대괄호 그룹이 있으면 그게 라벨이고
// 첫 번째는 아이콘이 된다.
const LINK_PATTERN = /^\[([^[\]]+)\](?:\[([^[\]]+)\])?\((.+)\)$/;

function parseLinkString(str: string): DocsLink {
  const disabled = str.startsWith("!");
  const rest = disabled ? str.slice(1) : str;

  const match = rest.match(LINK_PATTERN);

  if (!match) {
    throw new Error(`Invalid shorthand string: "${str}".`);
  }

  const [, first, second, url] = match;
  const icon = second !== undefined ? first : undefined;
  const label = second ?? first;

  return {
    type: "link",
    label,
    url,
    ...(icon && { icon }),
    ...(disabled && { disabled: true }),
  };
}
