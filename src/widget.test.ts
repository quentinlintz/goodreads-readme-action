import { describe, expect, test } from "vitest";
import { extractWidgetCode } from "./widget.js";
import path from "path";
import fs from "fs";

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
  "tests/fixtures/widget-read.txt",
);
const readHtmlPath = path.resolve(
  process.cwd(),
  "tests/fixtures/widget-read.expected.html",
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
