import { type DocsItem } from "@wondocs/core/sidebar";

import { type FileTree } from "@/filetree/types";
import { type LinkRef } from "@/meta/types";

export const testItems: DocsItem[] = [
  {
    type: "link",
    label: "Test Link",
    url: "/test-link",
    items: [
      {
        type: "link",
        label: "Test Sub Link",
        url: "/test-sub-link",
      },
    ],
  },
  {
    type: "group",
    label: "Test Group",
    items: [
      {
        type: "link",
        label: "Test Child Link",
        url: "/test-child-link",
      },
    ],
  },
  {
    type: "separator",
  },
  {
    type: "link",
    label: "Test External Link",
    url: "https://example.com",
    external: true,
  },
  {
    type: "group",
    label: "Test Group 2",
    items: [
      {
        type: "link",
        label: "Test Child Link 2",
        url: "/test-child-link-2",
      },
    ],
  },
];

export const expectedReturnItems: DocsItem[] = [
  {
    type: "link",
    label: "Test Link",
    url: "/test-collection/test-link",
    items: [
      {
        type: "link",
        label: "Test Sub Link",
        url: "/test-collection/test-sub-link",
      },
    ],
  },
  {
    type: "group",
    label: "Test Group",
    items: [
      {
        type: "link",
        label: "Test Child Link",
        url: "/test-collection/test-child-link",
      },
    ],
  },
  {
    type: "separator",
  },
  {
    type: "link",
    label: "Test External Link",
    url: "https://example.com",
    external: true,
  },
  {
    type: "group",
    label: "Test Group 2",
    items: [
      {
        type: "link",
        label: "Test Child Link 2",
        url: "/test-collection/test-child-link-2",
      },
    ],
  },
];

export const expectedReturnLinks: LinkRef[] = [
  { href: "/test-collection/test-link", external: false, disabled: false },
  {
    href: "/test-collection/test-sub-link",
    external: false,
    disabled: false,
  },
  {
    href: "/test-collection/test-child-link",
    external: false,
    disabled: false,
  },
  { href: "https://example.com", external: true, disabled: false },
  {
    href: "/test-collection/test-child-link-2",
    external: false,
    disabled: false,
  },
];

export const testTree: FileTree = {
  "test-leaf": "/path/to/test-leaf.md",
  "test-group/test-child-leaf": "/path/to/test-group/test-child-leaf.md",
};
