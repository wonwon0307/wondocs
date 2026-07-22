import { type FileTree } from "@/filetree/types";
import { type Item, type LinkRef } from "@/meta/types";

export const testItems: Item[] = [
  {
    type: "link",
    label: "Test Link",
    href: "/test-link",
  },
  {
    type: "group",
    label: "Test Group",
    items: [
      {
        type: "link",
        label: "Test Child Link",
        href: "/test-child-link",
      },
    ],
  },
  {
    type: "separator",
  },
  {
    type: "link",
    label: "Test External Link",
    href: "https://example.com",
    external: true,
  },
  {
    type: "group",
    label: "Test Group 2",
    items: [
      {
        type: "link",
        label: "Test Child Link 2",
        href: "/test-child-link-2",
      },
    ],
  },
];

export const expectedReturnItems: Item[] = [
  {
    type: "link",
    label: "Test Link",
    href: "test-collection/test-link",
  },
  {
    type: "group",
    label: "Test Group",
    items: [
      {
        type: "link",
        label: "Test Child Link",
        href: "test-collection/test-child-link",
      },
    ],
  },
  {
    type: "separator",
  },
  {
    type: "link",
    label: "Test External Link",
    href: "https://example.com",
    external: true,
  },
  {
    type: "group",
    label: "Test Group 2",
    items: [
      {
        type: "link",
        label: "Test Child Link 2",
        href: "test-collection/test-child-link-2",
      },
    ],
  },
];

export const expectedReturnLinks: LinkRef[] = [
  { href: "test-collection/test-link", external: false, disabled: false },
  {
    href: "test-collection/test-child-link",
    external: false,
    disabled: false,
  },
  { href: "https://example.com", external: true, disabled: false },
  {
    href: "test-collection/test-child-link-2",
    external: false,
    disabled: false,
  },
];

export const testTree: FileTree = {
  "test-leaf": "/path/to/test-leaf.md",
  "test-group/test-child-leaf": "/path/to/test-group/test-child-leaf.md",
};
