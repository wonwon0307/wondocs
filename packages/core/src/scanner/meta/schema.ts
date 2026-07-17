import { z } from "zod";

import type { Item } from "./types";

const LinkSchema = z.object({
  type: z.literal("link"),
  href: z.string().min(1, "A Link must have a non-empty href"),
  label: z.string().optional(),
  icon: z.string().optional(),
  badge: z.string().optional(),
  external: z.boolean().optional(),
  disabled: z.boolean().optional(),
  items: z.lazy(() => ItemSchema.array()).optional(),
  defaultOpen: z.boolean().optional(),
});

const GroupSchema = z.object({
  type: z.literal("group"),
  label: z.string(),
  icon: z.string().optional(),
  badge: z.string().optional(),
  items: z.lazy(() =>
    ItemSchema.array().min(1, "A Group must have at least one item"),
  ),
  defaultOpen: z.boolean().optional(),
});

const SeparatorSchema = z.object({
  type: z.literal("separator"),
  label: z.string().optional(),
  icon: z.string().optional(),
});

export const ItemSchema: z.ZodType<Item> = z.lazy(() =>
  z.discriminatedUnion("type", [LinkSchema, GroupSchema, SeparatorSchema]),
);

export const MetaFileSchema = z.object({
  prefix: z.string().optional(),
  items: ItemSchema.array().min(1, "Meta file must have at least one item"),
});
