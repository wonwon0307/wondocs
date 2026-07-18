import { type Item } from "@/meta/types";

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

export const expectedReturnHrefs: Set<string> = new Set([
  "test-collection/test-link",
  "test-collection/test-child-link",
  "https://example.com",
  "test-collection/test-child-link-2",
]);
