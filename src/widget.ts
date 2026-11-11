import { z } from "zod";
import JSON5 from "json5";
import * as cheerio from "cheerio";
import { bookSchema } from "./parser.js";

const isOnlyDigits = (str: string): boolean => {
  return /^\d+$/.test(str);
};

const validateReviewUrl = (val: string): boolean => {
  try {
    const url = new URL(val);
    const protocol = url.protocol === "https:";
    const hostname = url.hostname === "www.goodreads.com";
    const pathnameSplit = url.pathname.split("/");
    const validPathname =
      pathnameSplit.length === 4 &&
      pathnameSplit[1] === "review" &&
      pathnameSplit[2] === "show" &&
      typeof pathnameSplit[3] === "string" &&
      isOnlyDigits(pathnameSplit[3]);
    return protocol && hostname && validPathname;
  } catch {
    return false;
  }
};

export const widgetBookSchema = bookSchema
  .pick({
    title: true,
    author_name: true,
    user_rating: true,
  })
  .extend({
    review_url: z.url().refine((val) => validateReviewUrl(val), {
      message: "Expected an HTTPS Goodreads review URL",
    }),
  });

export type WidgetBook = z.infer<typeof widgetBookSchema>;

const checkEndingBackslashes = (text: string): boolean => {
  let count = 0;
  for (let i = text.length - 2; i >= 0; i--) {
    if (text[i] === "\\") {
      count++;
    } else {
      break;
    }
  }
  return count % 2 === 0;
};

export const extractWidgetCode = (text: string): string => {
  const widgetCodePrefix = "var widget_code = ";

  const lines = text.split(/\r?\n/);
  const widgetCodeLine = lines.find((line) => line.includes(widgetCodePrefix));
  if (!widgetCodeLine) {
    throw new Error("Widget code line not found");
  }
  const trimmedWidgetCodeLine = widgetCodeLine.trim();

  const hasClosingQuote = trimmedWidgetCodeLine.endsWith("'");
  if (
    !hasClosingQuote ||
    trimmedWidgetCodeLine === widgetCodePrefix ||
    !checkEndingBackslashes(trimmedWidgetCodeLine)
  ) {
    throw new Error("Widget code does not have closing quote");
  }

  const extractedWidgetCode = trimmedWidgetCodeLine.slice(
    trimmedWidgetCodeLine.indexOf(widgetCodePrefix) + widgetCodePrefix.length,
  );
  const parsedWidgetCode: unknown = JSON5.parse(extractedWidgetCode);

  if (typeof parsedWidgetCode !== "string") {
    throw new Error("Widget code is not of type string");
  }

  return parsedWidgetCode;
};

export const parseHtml = (widgetCode: string): WidgetBook[] => {
  const books: WidgetBook[] = [];
  const $ = cheerio.load(widgetCode, null, false);
  const customContainer = $('[class^="gr_custom_container_"]');
  if (customContainer.length === 0) throw new Error("Missing custom container");
  const shelfHeader = customContainer.children('[class^="gr_custom_header_"]');
  const eachContainer = customContainer.children(
    '[class^="gr_custom_each_container_"]',
  );
  if (eachContainer.length === 0) {
    if (shelfHeader.length !== 0) return [];
    throw new Error("Missing widget header");
  }
  eachContainer.each((_, el) => {
    const titleContainer = $(el).find('[class^="gr_custom_title_"]');
    if (titleContainer.length === 0) throw new Error("Missing title container");
    const titleAnchor = titleContainer.eq(0).find("a").eq(0);
    const title = titleAnchor.text().trim();
    const reviewUrl = titleAnchor.attr("href")?.split("?")[0];

    const authorContainer = $(el).find('[class^="gr_custom_author_"]');
    if (authorContainer.length === 0)
      throw new Error("Missing author container");
    const authorAnchor = authorContainer.eq(0).find("a").eq(0);
    const authorName = authorAnchor.text().trim();

    let userRating = 0;
    let inactiveStars = 0;
    const ratingContainer = $(el).find('[class^="gr_custom_rating_"]');
    if (ratingContainer.length === 0)
      throw new Error("Missing rating container");
    const ratingSpan = ratingContainer.eq(0).find("span");
    if (ratingSpan.length === 0) throw new Error("Missing rating span");
    ratingSpan
      .eq(0)
      .children("img")
      .each((_, el) => {
        const star = $(el).attr("src");
        if (
          star ===
          "https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png"
        ) {
          userRating++;
        } else if (
          star ===
          "https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png"
        ) {
          inactiveStars++;
        } else {
          throw new Error("Unrecognized star image url");
        }
      });
    if (userRating + inactiveStars !== 5) {
      throw new Error(
        "Incorrect number of active and inactive stars in rating",
      );
    }
    const book = widgetBookSchema.parse({
      title,
      author_name: authorName,
      review_url: reviewUrl,
      user_rating: userRating,
    });
    books.push(book);
  });
  return books;
};
