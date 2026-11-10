import fs from "fs";
import path from "path";
import { fetchShelf } from "./fetch.js";
import { parseInputs, type ParseInputsParams } from "./inputs.js";
import { orderShelf } from "./ordering.js";
import { parseXml, type Book } from "./parser.js";
import { replaceSection } from "./readme.js";
import { renderShelf, type RenderableBook } from "./render.js";
import type { WidgetBook } from "./widget.js";

export type UpdateReadmeOutput = {
  hasChanged: boolean;
  bookCount: number;
};

export const rssConverter = (books: Book[]): RenderableBook[] => {
  return books.map((book) => ({
    title: book.title,
    authorName: book.author_name,
    userRating: book.user_rating,
    url: `https://www.goodreads.com/book/show/${book.book_id}`,
  }));
};

export const widgetConverter = (books: WidgetBook[]): RenderableBook[] => {
  return books.map((book) => ({
    title: book.title,
    authorName: book.author_name,
    userRating: book.user_rating,
    url: book.review_url,
  }));
};

export const updateReadme = async (
  params: ParseInputsParams,
): Promise<UpdateReadmeOutput> => {
  const actionConfig = parseInputs(params);
  const { goodreadsId, shelf, readmePath, marker, sort, ratings, limit } =
    actionConfig;

  const readmeFilePath = path.resolve(process.cwd(), readmePath);
  const readmeData = fs.readFileSync(readmeFilePath, "utf-8");
  const fetched = await fetchShelf(goodreadsId, shelf);
  const parsed = parseXml(fetched);
  const ordered = orderShelf(parsed, sort, limit);
  const renderable = rssConverter(ordered);
  const rendered = renderShelf(renderable, ratings);
  const replaced = replaceSection(readmeData, marker, rendered);

  if (replaced === readmeData) {
    return {
      hasChanged: false,
      bookCount: ordered.length,
    };
  }

  fs.writeFileSync(readmeFilePath, replaced);

  return {
    hasChanged: true,
    bookCount: ordered.length,
  };
};
