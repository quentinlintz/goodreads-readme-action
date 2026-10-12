import { z, type RefinementCtx } from "zod";
import { XMLParser, type JPathOrMatcher } from "fast-xml-parser";
import { SyntaxValidator } from "fast-xml-validator";

const parseDateString = (
  dateString: string | undefined,
  ctx: RefinementCtx,
): number | undefined => {
  if (!dateString || dateString.trim() === "") {
    return undefined;
  }

  const timestamp = Date.parse(dateString);
  if (Number.isNaN(timestamp)) {
    ctx.addIssue({
      code: "custom",
      message: `Invalid date string: ${dateString}`,
    });
    return z.NEVER;
  }

  return timestamp;
};

export const bookSchema = z.object({
  title: z.string().min(1),
  book_id: z.number().int().min(1),
  author_name: z.string().min(1),
  user_rating: z.preprocess(
    (rating) => (rating === "" ? 0 : rating),
    z.number().min(0).max(5),
  ),
  user_read_at: z
    .string()
    .optional()
    .transform((date, ctx) => parseDateString(date, ctx)),
  user_date_added: z
    .string()
    .optional()
    .transform((date, ctx) => parseDateString(date, ctx)),
});

export type Book = z.infer<typeof bookSchema>;

const rssSchema = z.object({
  rss: z.object({
    channel: z.preprocess(
      (data) => (data === "" ? {} : data),
      z.object({
        item: bookSchema.array().optional(),
      }),
    ),
  }),
});

const options = {
  isArray: (_tagName: string, jpath: JPathOrMatcher) =>
    jpath === "rss.channel.item",
  tagValueProcessor: (_tagName: string, val: string, jpath: JPathOrMatcher) => {
    if (
      jpath === "rss.channel.item.title" ||
      jpath === "rss.channel.item.author_name"
    ) {
      return undefined;
    }
    return val;
  },
};

export const parseXml = (xml: string): Book[] => {
  SyntaxValidator.validate(xml);
  const parser = new XMLParser(options);
  const parsedXml = parser.parse(xml) as unknown;
  const rssData = rssSchema.parse(parsedXml);
  const books = rssData.rss.channel.item;
  return books ? books : [];
};
