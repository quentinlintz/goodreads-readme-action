import fs from "fs";
import path from "path";
import { describe, expect, test } from "vitest";
import { parseXml } from "./parser.js";
import { orderShelf, SortChoice } from "./ordering.js";
import { renderShelf } from "./render.js";
import { rssConverter, widgetConverter } from "./update.js";
import { parseHtml } from "./widget.js";

const currentlyReadingXmlFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/currently-reading.xml",
);
const singleBookXmlFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/single-book.xml",
);
const readXmlFilePath = path.resolve(process.cwd(), "tests/fixtures/read.xml");
const validEmptyXmlFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/valid-empty.xml",
);

const currentlyReadingMarkdownFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/currently-reading.expected.md",
);
const singleBookMarkdownFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/single-book.expected.md",
);
const readMarkdownFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/read.expected.md",
);
const validEmptyMarkdownFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/valid-empty.expected.md",
);

const currentlyReadingXmlData = fs.readFileSync(
  currentlyReadingXmlFilePath,
  "utf-8",
);
const singleBookXmlData = fs.readFileSync(singleBookXmlFilePath, "utf-8");
const readXmlData = fs.readFileSync(readXmlFilePath, "utf-8");
const validEmptyXmlData = fs.readFileSync(validEmptyXmlFilePath, "utf-8");

const currentlyReadingRendered = fs.readFileSync(
  currentlyReadingMarkdownFilePath,
  "utf-8",
);
const singleBookRendered = fs.readFileSync(singleBookMarkdownFilePath, "utf-8");
const readRendered = fs.readFileSync(readMarkdownFilePath, "utf-8");
const validEmptyRendered = fs.readFileSync(validEmptyMarkdownFilePath, "utf-8");

const rssPipeline = (
  xml: string,
  sort: SortChoice = SortChoice.DateAdded,
  limit: number = 10,
  rating: boolean = false,
): string => {
  const shelfData = parseXml(xml);
  const orderedShelf = orderShelf(shelfData, sort, limit);
  const renderable = rssConverter(orderedShelf);
  return renderShelf(renderable, rating);
};

describe("rss pipeline", () => {
  test("currently reading shelf sorted by date added, limit 10, ratings on", () => {
    expect(
      rssPipeline(currentlyReadingXmlData, SortChoice.DateAdded, 10, true),
    ).toBe(currentlyReadingRendered.replace(/\n$/, ""));
  });

  test("read shelf sorted by date read, limit 6, ratings on", () => {
    expect(rssPipeline(readXmlData, SortChoice.DateRead, 6, true)).toBe(
      readRendered.replace(/\n$/, ""),
    );
  });

  test("single book shelf sorted by date added, limit 1, ratings off", () => {
    expect(rssPipeline(singleBookXmlData, SortChoice.DateAdded, 1, false)).toBe(
      singleBookRendered.replace(/\n$/, ""),
    );
  });

  test("valid empty shelf, all defaults", () => {
    expect(rssPipeline(validEmptyXmlData)).toBe(
      validEmptyRendered.replace(/\n$/, ""),
    );
  });
});

const currentlyReadingHtmlFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/widget-currently-reading.expected.html",
);
const readHtmlFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/widget-read-dr-desc.expected.html",
);

const widgetCurrentlyReadingMarkdownFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/widget-currently-reading.expected.md",
);
const widgetReadMarkdownFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/widget-read-dr-desc.expected.md",
);
const widgetReadRatingsMarkdownFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/widget-read-dr-desc-ratings.expected.md",
);

const currentlyReadingHtmlData = fs.readFileSync(
  currentlyReadingHtmlFilePath,
  "utf-8",
);
const readHtmlData = fs.readFileSync(readHtmlFilePath, "utf-8");

const widgetCurrentlyReadingRendered = fs.readFileSync(
  widgetCurrentlyReadingMarkdownFilePath,
  "utf-8",
);
const widgetReadRendered = fs.readFileSync(widgetReadMarkdownFilePath, "utf-8");
const widgetReadRatingsRendered = fs.readFileSync(
  widgetReadRatingsMarkdownFilePath,
  "utf-8",
);

const widgetPipeline = (html: string, rating: boolean = false): string => {
  const shelfData = parseHtml(html);
  const renderable = widgetConverter(shelfData);
  return renderShelf(renderable, rating);
};

describe("widget pipeline", () => {
  test("currently reading shelf", () => {
    expect(widgetPipeline(currentlyReadingHtmlData)).toBe(
      widgetCurrentlyReadingRendered.replace(/\n$/, ""),
    );
  });

  test("read shelf", () => {
    expect(widgetPipeline(readHtmlData, true)).toBe(
      widgetReadRatingsRendered.replace(/\n$/, ""),
    );
  });

  test("read shelf, ratings off", () => {
    expect(widgetPipeline(readHtmlData, false)).toBe(
      widgetReadRendered.replace(/\n$/, ""),
    );
  });
});
