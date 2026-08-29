import { z } from "zod";

import type { DocsMeta, DocsItemInput } from "./types";

const LinkSchema = z.object({
  type: z.literal("link"),
  url: z.string().min(1, "A Link must have a url"),
  label: z.string().min(1, "A Link must have a label"),
  icon: z.string().min(1, "icon must be a non-empty string").optional(),
  right: z
    .union([z.string().min(1, "right must be a non-empty string"), z.number()])
    .optional(),
  external: z.boolean().optional(),
  disabled: z.boolean().optional(),
  items: z.lazy(() => ItemSchema.array()).optional(),
  defaultOpen: z.boolean().optional(),
});

const GroupSchema = z.object({
  type: z.literal("group"),
  label: z.string().min(1, "A Group must have a label"),
  icon: z.string().min(1, "icon must be a non-empty string").optional(),
  items: z.lazy(() =>
    ItemSchema.array().min(1, "A Group must have at least one item"),
  ),
  defaultOpen: z.boolean().optional(),
});

const SeparatorSchema = z.object({
  type: z.literal("separator"),
  label: z.string().min(1, "label must be a non-empty string").optional(),
  icon: z.string().min(1, "icon must be a non-empty string").optional(),
});

const ItemShorthandSchema: z.ZodType<string> = z
  .string()
  .min(1, "A shorthand item must be a non-empty string");

const ItemSchema: z.ZodType<DocsItemInput> = z.lazy(() =>
  z
    .discriminatedUnion("type", [LinkSchema, GroupSchema, SeparatorSchema])
    .or(ItemShorthandSchema),
);

export const MetaFileSchema: z.ZodType<DocsMeta> = z.object({
  sidebar: ItemSchema.array().min(1, "Meta file must have at least one item"),
  baseUrl: z.string().min(1, "baseUrl must be a non-empty string").optional(),
  key: z.string().min(1, "key must be a non-empty string").optional(),
});
