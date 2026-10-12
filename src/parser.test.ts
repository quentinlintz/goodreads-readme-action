import fs from "fs";
import path from "path";
import { describe, expect, test } from "vitest";
import { parseXml, type Book } from "./parser.js";
import { ZodError } from "zod";

const singleBookFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/single-book.xml",
);
const readFilePath = path.resolve(process.cwd(), "tests/fixtures/read.xml");
const validEmptyFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/valid-empty.xml",
);
const notRssFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/not-rss.xml",
);
const malformedFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/malformed.xml",
);
const singleBookXmlData = fs.readFileSync(singleBookFilePath, "utf-8");
const readXmlData = fs.readFileSync(readFilePath, "utf-8");
const validEmptyXmlData = fs.readFileSync(validEmptyFilePath, "utf-8");
const notRssXmlData = fs.readFileSync(notRssFilePath, "utf-8");
const malformedXmlData = fs.readFileSync(malformedFilePath, "utf-8");

const expectedReadShelf: Book[] = [
  {
    title: "Cyrano De Bergerac : Heroic Comedy in Five Acts",
    author_name: "Edmond Rostand",
    book_id: 424764,
    user_rating: 5,
    user_date_added: 1787228972000,
    user_read_at: 1674777600000,
  },
  {
    title: "Ring (Ring, #1)",
    author_name: "Kōji Suzuki",
    book_id: 38379,
    user_rating: 5,
    user_date_added: 1787228790000,
    user_read_at: undefined,
  },
  {
    title: "A Gentleman in Moscow",
    author_name: "Amor Towles",
    book_id: 45695810,
    user_rating: 3,
    user_date_added: 1788729717000,
    user_read_at: 1788220800000,
  },
  {
    title: "Great Songwriting Techniques",
    author_name: "Jack Perricone",
    book_id: 39704081,
    user_rating: 5,
    user_date_added: 1788132826000,
    user_read_at: 1788048000000,
  },
  {
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    author_name: "Gabrielle Zevin",
    book_id: 77262337,
    user_rating: 2,
    user_date_added: 1787275861000,
    user_read_at: 1787184000000,
  },
  {
    title: "Atlas Shrugged",
    author_name: "Ayn Rand",
    book_id: 831575,
    user_rating: 5,
    user_date_added: 1787229012000,
    user_read_at: 1702339200000,
  },
];

const expectedSingleBookShelf: Book[] = [
  {
    title: "Our Oriental Heritage (The Story of Civilization, #1)*",
    author_name: "Will Durant",
    book_id: 49871725,
    user_rating: 3,
    user_date_added: 1787228931000,
    user_read_at: 1753401600000,
  },
];

describe("parseXml", () => {
  test("parses a single-book shelf", () => {
    const books = parseXml(singleBookXmlData);
    expect(books).toHaveLength(1);
    expect(books).toStrictEqual(expectedSingleBookShelf);
  });

  test("parses multi-book shelf", () => {
    const books = parseXml(readXmlData);
    expect(books).toHaveLength(6);
    expect(books).toStrictEqual(expectedReadShelf);
  });

  test("parses an empty shelf", () => {
    const books = parseXml(validEmptyXmlData);
    expect(books).toHaveLength(0);
  });

  test("rejects non-RSS data", () => {
    try {
      parseXml(notRssXmlData);
      expect.fail("parsing should have rejected the non-RSS");
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ["rss"],
            }),
          ]),
        );
      } else {
        throw error;
      }
    }
  });

  test("rejects malformed XML", () => {
    try {
      parseXml(malformedXmlData);
      expect.fail("parsing should have rejected the malformed XML");
    } catch (error: unknown) {
      if (error instanceof Error) {
        expect(error.message).toBe(
          "Expected closing tag 'item' (opened in line 21, col 5) instead of closing tag 'channel'.",
        );
      } else {
        throw error;
      }
    }
  });

  test("zero rating", () => {
    const rating = singleBookXmlData.replace(
      "<user_rating>3</user_rating>",
      "<user_rating>0</user_rating>",
    );
    const books = parseXml(rating);
    expect(books).toHaveLength(1);
    expect(books[0]?.user_rating).toBe(0);
  });

  test(".25 rating", () => {
    const rating = singleBookXmlData.replace(
      "<user_rating>3</user_rating>",
      "<user_rating>3.25</user_rating>",
    );
    const books = parseXml(rating);
    expect(books).toHaveLength(1);
    expect(books[0]?.user_rating).toBe(3.25);
  });

  test(".5 rating", () => {
    const rating = singleBookXmlData.replace(
      "<user_rating>3</user_rating>",
      "<user_rating>3.5</user_rating>",
    );
    const books = parseXml(rating);
    expect(books).toHaveLength(1);
    expect(books[0]?.user_rating).toBe(3.5);
  });

  test(".75 rating", () => {
    const rating = singleBookXmlData.replace(
      "<user_rating>3</user_rating>",
      "<user_rating>3.75</user_rating>",
    );
    const books = parseXml(rating);
    expect(books).toHaveLength(1);
    expect(books[0]?.user_rating).toBe(3.75);
  });

  test("-1 rating", () => {
    const rating = singleBookXmlData.replace(
      "<user_rating>3</user_rating>",
      "<user_rating>-1</user_rating>",
    );
    try {
      parseXml(rating);
      expect.fail("parsing should have rejected the -1 rating");
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              code: "too_small",
              message: "Too small: expected number to be >=0",
              path: ["rss", "channel", "item", 0, "user_rating"],
            }),
          ]),
        );
      } else {
        throw error;
      }
    }
  });

  test("6 rating", () => {
    const rating = singleBookXmlData.replace(
      "<user_rating>3</user_rating>",
      "<user_rating>6</user_rating>",
    );
    try {
      parseXml(rating);
      expect.fail("parsing should have rejected the 6 rating");
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              code: "too_big",
              message: "Too big: expected number to be <=5",
              path: ["rss", "channel", "item", 0, "user_rating"],
            }),
          ]),
        );
      } else {
        throw error;
      }
    }
  });

  test("leading zeroes in rating", () => {
    const rating = singleBookXmlData.replace(
      "<user_rating>3</user_rating>",
      "<user_rating>003</user_rating>",
    );
    const books = parseXml(rating);
    expect(books).toHaveLength(1);
    expect(books[0]?.user_rating).toBe(3);
  });

  test("blank rating", () => {
    const rating = singleBookXmlData.replace(
      "<user_rating>3</user_rating>",
      "<user_rating></user_rating>",
    );
    const books = parseXml(rating);
    expect(books.length).toBe(1);
    expect(books[0]).toBeDefined();
    expect(books[0]?.user_rating).toBe(0);
  });

  test("numeric title", () => {
    const numericTitle = singleBookXmlData.replace(
      "<title><![CDATA[Our Oriental Heritage (The Story of Civilization, #1)*]]></title>",
      "<title><![CDATA[1984]]></title>",
    );
    const books = parseXml(numericTitle);
    expect(books.length).toBe(1);
    expect(books[0]).toBeDefined();
    expect(books[0]?.title).toBe("1984");
  });

  test("numeric title parsed", () => {
    const numericTitle = singleBookXmlData.replace(
      "<title><![CDATA[Our Oriental Heritage (The Story of Civilization, #1)*]]></title>",
      "<title><![CDATA[1e3]]></title>",
    );
    const books = parseXml(numericTitle);
    expect(books.length).toBe(1);
    expect(books[0]).toBeDefined();
    expect(books[0]?.title).toBe("1e3");
  });

  test("empty channel", () => {
    const emptyChannel = `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" ><channel></channel></rss>`;
    const books = parseXml(emptyChannel);
    expect(books).toHaveLength(0);
  });

  test("absent field", () => {
    const absentField = readXmlData.replace(
      "<user_read_at><![CDATA[Tue, 12 Dec 2023 00:00:00 +0000]]></user_read_at>",
      "",
    );
    const books = parseXml(absentField);
    expect(books.length).toBe(6);
    expect(books[5]).toBeDefined();
    expect(books[5]?.user_read_at).toBe(undefined);
  });

  test("whitespace-only date string", () => {
    const whitespaceOnly = readXmlData.replace(
      "<user_read_at><![CDATA[Tue, 12 Dec 2023 00:00:00 +0000]]></user_read_at>",
      "<user_read_at>      </user_read_at>",
    );
    const books = parseXml(whitespaceOnly);
    expect(books.length).toBe(6);
    expect(books[5]).toBeDefined();
    expect(books[5]?.user_read_at).toBe(undefined);
  });

  test("missing title", () => {
    const titleRemoved = singleBookXmlData.replace(
      "<title><![CDATA[Our Oriental Heritage (The Story of Civilization, #1)*]]></title>",
      "",
    );
    try {
      parseXml(titleRemoved);
      expect.fail("parsing should have rejected the missing title");
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ["rss", "channel", "item", 0, "title"],
            }),
          ]),
        );
      } else {
        throw error;
      }
    }
  });

  test("mismatched title tags", () => {
    const titleMismatch = singleBookXmlData.replace("</title>", "</wrong>");
    expect(() => parseXml(titleMismatch)).toThrow(
      "Expected closing tag 'title' (opened in line 4, col 9) instead of closing tag 'wrong'.",
    );
  });

  test("misformatted date string", () => {
    const dateMisformatted = readXmlData.replace(
      "<user_read_at><![CDATA[Tue, 12 Dec 2023 00:00:00 +0000]]></user_read_at>",
      "<user_read_at><![CDATA[Tue, 12 De2023 00:00:00 +0000]]></user_read_at>",
    );
    try {
      parseXml(dateMisformatted);
      expect.fail("parsing should have rejected the misformatted date string");
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              code: "custom",
              message: "Invalid date string: Tue, 12 De2023 00:00:00 +0000",
              path: ["rss", "channel", "item", 5, "user_read_at"],
            }),
          ]),
        );
      } else {
        throw error;
      }
    }
  });
});
