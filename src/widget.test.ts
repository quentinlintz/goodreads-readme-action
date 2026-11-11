import { describe, expect, test } from "vitest";
import { extractWidgetCode, parseHtml, type WidgetBook } from "./widget.js";
import path from "path";
import fs from "fs";
import { ZodError } from "zod";

const currentlyReadingTxtPath = path.resolve(
  process.cwd(),
  "tests/fixtures/widget-currently-reading.txt",
);
const currentlyReadingHtmlPath = path.resolve(
  process.cwd(),
  "tests/fixtures/widget-currently-reading.expected.html",
);
const readTxtPath = path.resolve(
  process.cwd(),
  "tests/fixtures/widget-read-dr-desc.txt",
);
const emptyTxtPath = path.resolve(
  process.cwd(),
  "tests/fixtures/widget-valid-empty.txt",
);
const emptyHtmlPath = path.resolve(
  process.cwd(),
  "tests/fixtures/widget-valid-empty.expected.html",
);
const readHtmlPath = path.resolve(
  process.cwd(),
  "tests/fixtures/widget-read-dr-desc.expected.html",
);
const currentlyReadingTxtData = fs.readFileSync(
  currentlyReadingTxtPath,
  "utf-8",
);
const currentlyReadingHtmlData = fs.readFileSync(
  currentlyReadingHtmlPath,
  "utf-8",
);
const readTxtData = fs.readFileSync(readTxtPath, "utf-8");
const readHtmlData = fs.readFileSync(readHtmlPath, "utf-8");
const emptyTxtData = fs.readFileSync(emptyTxtPath, "utf-8");
const emptyHtmlData = fs.readFileSync(emptyHtmlPath, "utf-8");
const expectedCurrentlyReading: WidgetBook[] = [
  {
    title:
      "Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems",
    author_name: "Martin Kleppmann",
    user_rating: 0,
    review_url: "https://www.goodreads.com/review/show/8889919757",
  },
  {
    title: "The Black Prince",
    author_name: "Iris Murdoch",
    user_rating: 0,
    review_url: "https://www.goodreads.com/review/show/9046024131",
  },
];
const expectedRead: WidgetBook[] = [
  {
    title: "The Fisherman",
    author_name: "John  Langan",
    user_rating: 4,
    review_url: "https://www.goodreads.com/review/show/9030365344",
  },
  {
    title:
      "Show Your Work!: 10 Ways to Share Your Creativity and Get Discovered",
    author_name: "Austin Kleon",
    user_rating: 5,
    review_url: "https://www.goodreads.com/review/show/9021062245",
  },
  {
    title: "The Hobbit",
    author_name: "J.R.R. Tolkien",
    user_rating: 3,
    review_url: "https://www.goodreads.com/review/show/8980887441",
  },
  {
    title: "Martin Eden",
    author_name: "Jack London",
    user_rating: 1,
    review_url: "https://www.goodreads.com/review/show/8980726689",
  },
  {
    title: "Piranesi",
    author_name: "Susanna Clarke",
    user_rating: 2,
    review_url: "https://www.goodreads.com/review/show/8972224296",
  },
];

describe("extractWidgetCode", () => {
  const widgetCode = "test";

  test("extracts inside widget_code", () => {
    const text = ` var widget_code = '${widgetCode}'`;
    const result = extractWidgetCode(text);
    expect(result).toBe(widgetCode);
  });

  test("extracts currently reading fixture", () => {
    const result = extractWidgetCode(currentlyReadingTxtData);
    expect(result).toBe(currentlyReadingHtmlData);
  });

  test("extracts read fixture", () => {
    const result = extractWidgetCode(readTxtData);
    expect(result).toBe(readHtmlData);
  });

  test("extracts empty fixture", () => {
    const result = extractWidgetCode(emptyTxtData);
    expect(result).toBe(emptyHtmlData);
  });

  test("extracts inside widget_code multiline", () => {
    const text = ` 

  var widget_code = '${widgetCode}'

`;
    const result = extractWidgetCode(text);
    expect(result).toBe(widgetCode);
  });

  test("crlf ending", () => {
    const text = ` var widget_code = '${widgetCode}'\r\n`;
    const result = extractWidgetCode(text);
    expect(result).toBe(widgetCode);
  });

  test("final apostrophe two backslashes", () => {
    const widgetCode = String.raw`test\\`;
    const text = String.raw` var widget_code = '${widgetCode}'`;
    const result = extractWidgetCode(text);
    expect(result).toBe("test\\");
  });

  test("whitespace before last apostrophe", () => {
    const widgetCode = "test  ";
    const text = String.raw` var widget_code = '${widgetCode}'`;
    const result = extractWidgetCode(text);
    expect(result).toBe(widgetCode);
  });

  test("whitespace after last apostrophe", () => {
    const text = ` var widget_code = '${widgetCode}'  `;
    const result = extractWidgetCode(text);
    expect(result).toBe(widgetCode);
  });

  test("empty", () => {
    const widgetCode = "";
    const text = ` var widget_code = '${widgetCode}'  `;
    const result = extractWidgetCode(text);
    expect(result).toBe(widgetCode);
  });

  test("encoded backslash and n", () => {
    const widgetCode = String.raw`\\n`;
    const text = String.raw` var widget_code = '${widgetCode}'`;
    const result = extractWidgetCode(text);
    expect(result).toBe("\\n");
  });

  test("escaped apostrophe", () => {
    const widgetCode = String.raw`reader\'s`;
    const text = String.raw` var widget_code = '${widgetCode}'`;
    const result = extractWidgetCode(text);
    expect(result).toBe("reader's");
  });

  test("not found", () => {
    const text = ` var widgets_code = '${widgetCode}'`;
    expect(() => extractWidgetCode(text)).toThrow("Widget code line not found");
  });

  test("no closing quote", () => {
    const text = ` var widget_code = '${widgetCode}`;
    expect(() => extractWidgetCode(text)).toThrow(
      "Widget code does not have closing quote",
    );
  });

  test("ends early", () => {
    const text = ` var widget_code = '`;
    expect(() => extractWidgetCode(text)).toThrow(
      "JSON5: invalid end of input at 1:2",
    );
  });

  test("escaped closing apostrophe", () => {
    const text = String.raw` var widget_code = '\'`;
    expect(() => extractWidgetCode(text)).toThrow(
      "Widget code does not have closing quote",
    );
  });

  test("non-string widget code", () => {
    const widgetCode = String.raw`[] // '`;
    const text = String.raw` var widget_code = ${widgetCode}`;
    expect(() => extractWidgetCode(text)).toThrow(
      "Widget code is not of type string",
    );
  });

  test("malformed hexadecimal escape", () => {
    const widgetCode = String.raw`\xZZ`;
    const text = String.raw` var widget_code = '${widgetCode}'`;
    expect(() => extractWidgetCode(text)).toThrow(
      "JSON5: invalid character 'Z' at 1:4",
    );
  });

  test("malformed unicode escape", () => {
    const widgetCode = String.raw`\u12G4`;
    const text = String.raw` var widget_code = '${widgetCode}'`;
    expect(() => extractWidgetCode(text)).toThrow(
      "JSON5: invalid character 'G'",
    );
  });
});

describe("parseHtml", () => {
  test("parse currently reading", () => {
    const parsed = parseHtml(currentlyReadingHtmlData);
    expect(parsed).toStrictEqual(expectedCurrentlyReading);
  });

  test("parse read", () => {
    const parsed = parseHtml(readHtmlData);
    expect(parsed).toStrictEqual(expectedRead);
  });

  test("missing title", () => {
    const titleRemoved = readHtmlData.replace(">The Fisherman<", "><");
    try {
      parseHtml(titleRemoved);
      expect.fail("parsing should have rejected the empty title");
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              code: "too_small",
              message: "Too small: expected string to have >=1 characters",
              path: ["title"],
            }),
          ]),
        );
      } else {
        throw error;
      }
    }
  });

  test("whitespace only author", () => {
    const titleRemoved = readHtmlData.replace(">John  Langan<", ">    <");
    try {
      parseHtml(titleRemoved);
      expect.fail("parsing should have rejected the whitespace author name");
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              code: "too_small",
              message: "Too small: expected string to have >=1 characters",
              path: ["author_name"],
            }),
          ]),
        );
      } else {
        throw error;
      }
    }
  });

  test("invalid protocol href", () => {
    const malformedHref = readHtmlData.replace(
      `<a rel="nofollow" href="https://www.goodreads.com/review/show/9030365344?utm_medium=api&amp;utm_source=custom_widget">The Fisherman</a>`,
      `<a rel="nofollow" href="http://www.goodreads.com/review/show/9030365344?utm_medium=api&amp;utm_source=custom_widget">The Fisherman</a>`,
    );
    try {
      parseHtml(malformedHref);
      expect.fail("parsing should have rejected the invalid protocol");
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              code: "custom",
              message: "Expected an HTTPS Goodreads review URL",
              path: ["review_url"],
            }),
          ]),
        );
      } else {
        throw error;
      }
    }
  });

  test("invalid hostname href", () => {
    const malformedHref = readHtmlData.replace(
      `<a rel="nofollow" href="https://www.goodreads.com/review/show/9030365344?utm_medium=api&amp;utm_source=custom_widget">The Fisherman</a>`,
      `<a rel="nofollow" href="https://www.example.com/review/show/9030365344?utm_medium=api&amp;utm_source=custom_widget">The Fisherman</a>`,
    );
    try {
      parseHtml(malformedHref);
      expect.fail("parsing should have rejected the invalid hostname");
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              code: "custom",
              message: "Expected an HTTPS Goodreads review URL",
              path: ["review_url"],
            }),
          ]),
        );
      } else {
        throw error;
      }
    }
  });

  test("missing review link", () => {
    const malformedHref = readHtmlData.replace(
      `<a rel="nofollow" href="https://www.goodreads.com/review/show/9030365344?utm_medium=api&amp;utm_source=custom_widget">The Fisherman</a>`,
      `<a rel="nofollow" href="">The Fisherman</a>`,
    );
    try {
      parseHtml(malformedHref);
      expect.fail("parsing should have rejected the missing href");
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              code: "custom",
              message: "Expected an HTTPS Goodreads review URL",
              path: ["review_url"],
            }),
          ]),
        );
      } else {
        throw error;
      }
    }
  });

  test("invalid review link path", () => {
    const malformedHref = readHtmlData.replace(
      `<a rel="nofollow" href="https://www.goodreads.com/review/show/9030365344?utm_medium=api&amp;utm_source=custom_widget">The Fisherman</a>`,
      `<a rel="nofollow" href="https://www.goodreads.com/reviews/show/9030365344?utm_medium=api&amp;utm_source=custom_widget">The Fisherman</a>`,
    );
    try {
      parseHtml(malformedHref);
      expect.fail("parsing should have rejected the missing href");
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              code: "custom",
              message: "Expected an HTTPS Goodreads review URL",
              path: ["review_url"],
            }),
          ]),
        );
      } else {
        throw error;
      }
    }
  });

  test("first valid, second broken", () => {
    const missingAuthorName = readHtmlData.replace(
      `by <a rel="nofollow" href="https://www.goodreads.com/author/show/2985039.Austin_Kleon">Austin Kleon</a>`,
      `by <a rel="nofollow" href="https://www.goodreads.com/author/show/2985039.Austin_Kleon"></a>`,
    );
    try {
      parseHtml(missingAuthorName);
      expect.fail("parsing should have rejected the empty author name");
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        expect(error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              code: "too_small",
              message: "Too small: expected string to have >=1 characters",
              path: ["author_name"],
            }),
          ]),
        );
      } else {
        throw error;
      }
    }
  });

  test("different classes", () => {
    const differentClasses = readHtmlData.replaceAll(
      `1793585492`,
      `1234567890`,
    );
    const parsed = parseHtml(differentClasses);
    expect(parsed).toStrictEqual(expectedRead);
  });

  test("html in title", () => {
    const htmlInTitle = readHtmlData.replace(
      `<a rel="nofollow" href="https://www.goodreads.com/review/show/9030365344?utm_medium=api&amp;utm_source=custom_widget">The Fisherman</a>`,
      `<a rel="nofollow" href="https://www.goodreads.com/review/show/9030365344?utm_medium=api&amp;utm_source=custom_widget">&#39;The Fisherman&amp;</a>`,
    );
    const expectedhtmlInTitle = [
      { ...expectedRead[0], title: "'The Fisherman&" },
      expectedRead[1],
      expectedRead[2],
      expectedRead[3],
      expectedRead[4],
    ];
    const parsed = parseHtml(htmlInTitle);
    expect(parsed).toStrictEqual(expectedhtmlInTitle);
  });

  test("missing rating span", () => {
    const wrongStarImage = readHtmlData.replace(
      `<span class=" staticStars notranslate" title="really liked it"><img style="width:15px;height:15px" alt="really liked it" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png" /></span>`,
      ``,
    );
    expect(() => parseHtml(wrongStarImage)).toThrow("Missing rating span");
  });

  test("unrecognized star images", () => {
    const wrongStarImage = readHtmlData.replace(
      `<span class=" staticStars notranslate" title="really liked it"><img style="width:15px;height:15px" alt="really liked it" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png" /></span>`,
      `<span class=" staticStars notranslate" title="really liked it"><img style="width:15px;height:15px" alt="really liked it" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://assets.com/images/layout/gr_flat_red_star_inactive.png" /></span>`,
    );
    expect(() => parseHtml(wrongStarImage)).toThrow(
      "Unrecognized star image url",
    );
  });

  test("six star images", () => {
    const wrongStarImage = readHtmlData.replace(
      `<span class=" staticStars notranslate" title="really liked it"><img style="width:15px;height:15px" alt="really liked it" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png" /></span>`,
      `<span class=" staticStars notranslate" title="really liked it"><img style="width:15px;height:15px" alt="really liked it" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png" /></span>`,
    );
    expect(() => parseHtml(wrongStarImage)).toThrow(
      "Incorrect number of active and inactive stars in rating",
    );
  });

  test("four star images", () => {
    const wrongStarImage = readHtmlData.replace(
      `<span class=" staticStars notranslate" title="really liked it"><img style="width:15px;height:15px" alt="really liked it" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png" /></span>`,
      `<span class=" staticStars notranslate" title="really liked it"><img style="width:15px;height:15px" alt="really liked it" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /><img style="width:15px;height:15px" alt="" src="https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png" /></span>`,
    );
    expect(() => parseHtml(wrongStarImage)).toThrow(
      "Incorrect number of active and inactive stars in rating",
    );
  });

  test("empty shelf", () => {
    const parsed = parseHtml(emptyHtmlData);
    expect(parsed).toEqual([]);
  });

  test("no header", () => {
    const noHeader = `
<div class="gr_custom_container_1794365618">
  <br style="clear: both"/>
  <center>
    <a rel="nofollow" href="https://www.goodreads.com/"><img alt="goodreads.com" style="border:0" src="https://s.gr-assets.com/images/widget/widget_logo.gif" /></a>
  </center>
  <noscript>
    Share <a rel="nofollow" href="https://www.goodreads.com/">book reviews</a> and ratings with Quentin, and even join a <a rel="nofollow" href="https://www.goodreads.com/group">book club</a> on Goodreads.
  </noscript>
</div>
`;
    expect(() => parseHtml(noHeader)).toThrow("Missing widget header");
  });

  test("unrelated html", () => {
    const unrelated = `<html><div class="hello"></div></html>`;
    expect(() => parseHtml(unrelated)).toThrow("Missing custom container");
  });
});
