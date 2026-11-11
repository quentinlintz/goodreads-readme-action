import { describe, expect, test } from "vitest";
import { renderShelf } from "./render.js";

const bookOne = {
  title: "Book 1",
  authorName: "Author 1",
  userRating: 5,
  url: `https://www.goodreads.com/book/show/1`,
};
const bookTwo = {
  title: "Book 2",
  authorName: "Author 2",
  userRating: 3,
  url: `https://www.goodreads.com/book/show/2`,
};

describe("renderShelf", () => {
  test("render default", () => {
    const expectedMarkdown = `- [Book 1](https://www.goodreads.com/book/show/1), Author 1
- [Book 2](https://www.goodreads.com/book/show/2), Author 2`;
    const markdown = renderShelf([bookOne, bookTwo]);
    expect(markdown).toBe(expectedMarkdown);
  });

  test("render rating", () => {
    const expectedMarkdown = `- [Book 1](https://www.goodreads.com/book/show/1), Author 1 ★★★★★ (5/5)
- [Book 2](https://www.goodreads.com/book/show/2), Author 2 ★★★☆☆ (3/5)`;
    const markdown = renderShelf([bookOne, bookTwo], true);
    expect(markdown).toBe(expectedMarkdown);
  });

  test("zero rating", () => {
    const expectedMarkdown = `- [Book 1](https://www.goodreads.com/book/show/1), Author 1
- [Book 2](https://www.goodreads.com/book/show/2), Author 2 ★★★☆☆ (3/5)`;
    const markdown = renderShelf(
      [{ ...bookOne, userRating: 0 }, bookTwo],
      true,
    );
    expect(markdown).toBe(expectedMarkdown);
  });

  test(".25 rating", () => {
    const expectedMarkdown = `- [Book 1](https://www.goodreads.com/book/show/1), Author 1 ★★★☆☆ (3.25/5)
- [Book 2](https://www.goodreads.com/book/show/2), Author 2 ★★★☆☆ (3/5)`;
    const markdown = renderShelf(
      [{ ...bookOne, userRating: 3.25 }, bookTwo],
      true,
    );
    expect(markdown).toBe(expectedMarkdown);
  });

  test(".5 rating", () => {
    const expectedMarkdown = `- [Book 1](https://www.goodreads.com/book/show/1), Author 1 ★★★☆☆ (3.5/5)
- [Book 2](https://www.goodreads.com/book/show/2), Author 2 ★★★☆☆ (3/5)`;
    const markdown = renderShelf(
      [{ ...bookOne, userRating: 3.5 }, bookTwo],
      true,
    );
    expect(markdown).toBe(expectedMarkdown);
  });

  test(".75 rating", () => {
    const expectedMarkdown = `- [Book 1](https://www.goodreads.com/book/show/1), Author 1 ★★★☆☆ (3.75/5)
- [Book 2](https://www.goodreads.com/book/show/2), Author 2 ★★★☆☆ (3/5)`;
    const markdown = renderShelf(
      [{ ...bookOne, userRating: 3.75 }, bookTwo],
      true,
    );
    expect(markdown).toBe(expectedMarkdown);
  });

  test("one book", () => {
    const expectedMarkdown = `- [Book 1](https://www.goodreads.com/book/show/1), Author 1`;
    const markdown = renderShelf([bookOne]);
    expect(markdown).toBe(expectedMarkdown);
  });

  test("empty shelf", () => {
    const expectedMarkdown = `Shelf is empty`;
    const markdown = renderShelf([]);
    expect(markdown).toBe(expectedMarkdown);
  });

  test("input shelf remains unchanged", () => {
    const input = [
      { ...bookTwo, title: "Book: 2!", authorName: "Author, 2\\" },
      bookOne,
      bookTwo,
    ];
    const inputCopied = structuredClone(input);
    renderShelf(input);
    expect(inputCopied).toStrictEqual(input);
  });

  test("escaped html text", () => {
    const expectedMarkdown = `- [Book 1](https://www.goodreads.com/book/show/1), \\<i\\>Author 1\\</i\\> ★★★★★ (5/5)
- [\\<i\\>Book 2\\</i\\>](https://www.goodreads.com/book/show/2), Author 2 ★★★☆☆ (3/5)`;
    const markdown = renderShelf(
      [
        { ...bookOne, authorName: "<i>Author 1</i>" },
        { ...bookTwo, title: "<i>Book 2</i>" },
      ],
      true,
    );
    expect(markdown).toBe(expectedMarkdown);
  });

  test("escaped markdown text", () => {
    const expectedMarkdown = `- [Book 1](https://www.goodreads.com/book/show/1), \\[Author 1\\] ★★★★★ (5/5)
- [\\[Book 2\\]](https://www.goodreads.com/book/show/2), Author 2 ★★★☆☆ (3/5)`;
    const markdown = renderShelf(
      [
        { ...bookOne, authorName: "[Author 1]" },
        { ...bookTwo, title: "[Book 2]" },
      ],
      true,
    );
    expect(markdown).toBe(expectedMarkdown);
  });

  test("escaped LF, CRLF, and CR", () => {
    const expectedMarkdown = `- [Book 1](https://www.goodreads.com/book/show/1), Author 1 ★★★★★ (5/5)
- [Book 2](https://www.goodreads.com/book/show/2), Author 2 ★★★☆☆ (3/5)`;
    const markdown = renderShelf(
      [
        {
          ...bookOne,
          title: "Book\n1\n",
          authorName: "Author\r\n1\r",
        },
        { ...bookTwo, title: "Book\r2\r", authorName: "Author 2\r\n" },
      ],
      true,
    );
    expect(markdown).toBe(expectedMarkdown);
  });

  test("escaped backslash, backtick, underscore, asterisk", () => {
    const expectedMarkdown =
      "- [Book 1](https://www.goodreads.com/book/show/1), Author 1 ★★★★★ (5/5)\n" +
      "- [\\_Book:\\_ \\`2\\!\\!\\`](https://www.goodreads.com/book/show/2), Author \\*2\\*\\.\\\\ ★★★☆☆ (3/5)";
    const markdown = renderShelf(
      [
        bookOne,
        { ...bookTwo, title: "_Book:_ `2!!`", authorName: "Author *2*.\\" },
      ],
      true,
    );
    expect(markdown).toBe(expectedMarkdown);
  });
});
