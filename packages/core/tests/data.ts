import { type Item } from "@/scanner";

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
