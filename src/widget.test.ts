import { describe, expect, test } from "vitest";
import { extractWidgetCode } from "./widget.js";
import path from "path";
import fs from "fs";

const widgetCurrentlyReadingFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/widget-currently-reading.txt",
);
const widgetReadFilePath = path.resolve(
  process.cwd(),
  "tests/fixtures/widget-read.txt",
);
const widgetCurrentlyReadingData = fs.readFileSync(
  widgetCurrentlyReadingFilePath,
  "utf-8",
);
const widgetReadData = fs.readFileSync(widgetReadFilePath, "utf-8");
const expectedWidgetCurrentlyReading = String.raw`  <div class=\"gr_custom_container_1793584645\">\n    <h2 class=\"gr_custom_header_1793584645\">\n    <a style=\"text-decoration: none;\" rel=\"nofollow\" href=\"https://www.goodreads.com/review/list/160841838-quentin-lintz?shelf=currently-reading&amp;utm_medium=api&amp;utm_source=custom_widget\">Quentin&#39;s bookshelf: currently-reading<\/a>\n    <\/h2>\n      <div class=\"gr_custom_each_container_1793584645\">\n          <div class=\"gr_custom_book_container_1793584645\">\n            <a title=\"Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems\" rel=\"nofollow\" href=\"https://www.goodreads.com/review/show/8889919757?utm_medium=api&amp;utm_source=custom_widget\"><img alt=\"Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems\" border=\"0\" src=\"https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1771369369l/248156714._SX50_.jpg\" /><\/a>\n          <\/div>\n          <div class=\"gr_custom_rating_1793584645\">\n            <span class=\" staticStars notranslate\"><img style=\"width:15px;height:15px\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png\" /><\/span>\n          <\/div>\n          <div class=\"gr_custom_title_1793584645\">\n            <a rel=\"nofollow\" href=\"https://www.goodreads.com/review/show/8889919757?utm_medium=api&amp;utm_source=custom_widget\">Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems<\/a>\n          <\/div>\n          <div class=\"gr_custom_author_1793584645\">\n            by <a rel=\"nofollow\" href=\"https://www.goodreads.com/author/show/7969625.Martin_Kleppmann\">Martin Kleppmann<\/a>\n          <\/div>\n          <div class=\"gr_custom_tags_1793584645\">\n            tagged:\n            software-engineering and currently-reading\n          <\/div>\n      <\/div>\n      <div class=\"gr_custom_each_container_1793584645\">\n          <div class=\"gr_custom_book_container_1793584645\">\n            <a title=\"The Black Prince\" rel=\"nofollow\" href=\"https://www.goodreads.com/review/show/9046024131?utm_medium=api&amp;utm_source=custom_widget\"><img alt=\"The Black Prince\" border=\"0\" src=\"https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1422802904l/120182._SY75_.jpg\" /><\/a>\n          <\/div>\n          <div class=\"gr_custom_rating_1793584645\">\n            <span class=\" staticStars notranslate\"><img style=\"width:15px;height:15px\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png\" /><\/span>\n          <\/div>\n          <div class=\"gr_custom_title_1793584645\">\n            <a rel=\"nofollow\" href=\"https://www.goodreads.com/review/show/9046024131?utm_medium=api&amp;utm_source=custom_widget\">The Black Prince<\/a>\n          <\/div>\n          <div class=\"gr_custom_author_1793584645\">\n            by <a rel=\"nofollow\" href=\"https://www.goodreads.com/author/show/7287.Iris_Murdoch\">Iris Murdoch<\/a>\n          <\/div>\n          <div class=\"gr_custom_tags_1793584645\">\n            tagged:\n            classics, literary-fiction, and currently-reading\n          <\/div>\n      <\/div>\n  <br style=\"clear: both\"/>\n  <center>\n    <a rel=\"nofollow\" href=\"https://www.goodreads.com/\"><img alt=\"goodreads.com\" style=\"border:0\" src=\"https://s.gr-assets.com/images/widget/widget_logo.gif\" /><\/a>\n  <\/center>\n  <noscript>\n    Share <a rel=\"nofollow\" href=\"https://www.goodreads.com/\">book reviews<\/a> and ratings with Quentin, and even join a <a rel=\"nofollow\" href=\"https://www.goodreads.com/group\">book club<\/a> on Goodreads.\n  <\/noscript>\n  <\/div>\n`;
const expectedWidgetRead = String.raw`  <div class=\"gr_custom_container_1793585492\">\n    <h2 class=\"gr_custom_header_1793585492\">\n    <a style=\"text-decoration: none;\" rel=\"nofollow\" href=\"https://www.goodreads.com/review/list/160841838-quentin-lintz?shelf=read&amp;utm_medium=api&amp;utm_source=custom_widget\">Quentin&#39;s bookshelf: read<\/a>\n    <\/h2>\n      <div class=\"gr_custom_each_container_1793585492\">\n          <div class=\"gr_custom_book_container_1793585492\">\n            <a title=\"The Fisherman\" rel=\"nofollow\" href=\"https://www.goodreads.com/review/show/9030365344?utm_medium=api&amp;utm_source=custom_widget\"><img alt=\"The Fisherman\" border=\"0\" src=\"https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1461603054l/29901930._SX50_.jpg\" /><\/a>\n          <\/div>\n          <div class=\"gr_custom_rating_1793585492\">\n            <span class=\" staticStars notranslate\" title=\"really liked it\"><img style=\"width:15px;height:15px\" alt=\"really liked it\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png\" /><\/span>\n          <\/div>\n          <div class=\"gr_custom_title_1793585492\">\n            <a rel=\"nofollow\" href=\"https://www.goodreads.com/review/show/9030365344?utm_medium=api&amp;utm_source=custom_widget\">The Fisherman<\/a>\n          <\/div>\n          <div class=\"gr_custom_author_1793585492\">\n            by <a rel=\"nofollow\" href=\"https://www.goodreads.com/author/show/7083555.John_Langan\">John  Langan<\/a>\n          <\/div>\n      <\/div>\n      <div class=\"gr_custom_each_container_1793585492\">\n          <div class=\"gr_custom_book_container_1793585492\">\n            <a title=\"Show Your Work!: 10 Ways to Share Your Creativity and Get Discovered (Austin Kleon)\" rel=\"nofollow\" href=\"https://www.goodreads.com/review/show/9021062245?utm_medium=api&amp;utm_source=custom_widget\"><img alt=\"Show Your Work!: 10 Ways to Share Your Creativity and Get Discovered\" border=\"0\" src=\"https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1394749483l/20874659._SX50_.jpg\" /><\/a>\n          <\/div>\n          <div class=\"gr_custom_rating_1793585492\">\n            <span class=\" staticStars notranslate\" title=\"it was amazing\"><img style=\"width:15px;height:15px\" alt=\"it was amazing\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png\" /><\/span>\n          <\/div>\n          <div class=\"gr_custom_title_1793585492\">\n            <a rel=\"nofollow\" href=\"https://www.goodreads.com/review/show/9021062245?utm_medium=api&amp;utm_source=custom_widget\">Show Your Work!: 10 Ways to Share Your Creativity and Get Discovered<\/a>\n          <\/div>\n          <div class=\"gr_custom_author_1793585492\">\n            by <a rel=\"nofollow\" href=\"https://www.goodreads.com/author/show/2985039.Austin_Kleon\">Austin Kleon<\/a>\n          <\/div>\n      <\/div>\n      <div class=\"gr_custom_each_container_1793585492\">\n          <div class=\"gr_custom_book_container_1793585492\">\n            <a title=\"The Hobbit (Middle Earth, #0)\" rel=\"nofollow\" href=\"https://www.goodreads.com/review/show/8980887441?utm_medium=api&amp;utm_source=custom_widget\"><img alt=\"The Hobbit\" border=\"0\" src=\"https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1519739410l/38819529._SY75_.jpg\" /><\/a>\n          <\/div>\n          <div class=\"gr_custom_rating_1793585492\">\n            <span class=\" staticStars notranslate\" title=\"liked it\"><img style=\"width:15px;height:15px\" alt=\"liked it\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png\" /><\/span>\n          <\/div>\n          <div class=\"gr_custom_title_1793585492\">\n            <a rel=\"nofollow\" href=\"https://www.goodreads.com/review/show/8980887441?utm_medium=api&amp;utm_source=custom_widget\">The Hobbit<\/a>\n          <\/div>\n          <div class=\"gr_custom_author_1793585492\">\n            by <a rel=\"nofollow\" href=\"https://www.goodreads.com/author/show/656983.J_R_R_Tolkien\">J.R.R. Tolkien<\/a>\n          <\/div>\n      <\/div>\n      <div class=\"gr_custom_each_container_1793585492\">\n          <div class=\"gr_custom_book_container_1793585492\">\n            <a title=\"Martin Eden\" rel=\"nofollow\" href=\"https://www.goodreads.com/review/show/8980726689?utm_medium=api&amp;utm_source=custom_widget\"><img alt=\"Martin Eden\" border=\"0\" src=\"https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1661678127l/929782._SY75_.jpg\" /><\/a>\n          <\/div>\n          <div class=\"gr_custom_rating_1793585492\">\n            <span class=\" staticStars notranslate\" title=\"did not like it\"><img style=\"width:15px;height:15px\" alt=\"did not like it\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png\" /><\/span>\n          <\/div>\n          <div class=\"gr_custom_title_1793585492\">\n            <a rel=\"nofollow\" href=\"https://www.goodreads.com/review/show/8980726689?utm_medium=api&amp;utm_source=custom_widget\">Martin Eden<\/a>\n          <\/div>\n          <div class=\"gr_custom_author_1793585492\">\n            by <a rel=\"nofollow\" href=\"https://www.goodreads.com/author/show/1240.Jack_London\">Jack London<\/a>\n          <\/div>\n      <\/div>\n      <div class=\"gr_custom_each_container_1793585492\">\n          <div class=\"gr_custom_book_container_1793585492\">\n            <a title=\"Piranesi\" rel=\"nofollow\" href=\"https://www.goodreads.com/review/show/8972224296?utm_medium=api&amp;utm_source=custom_widget\"><img alt=\"Piranesi\" border=\"0\" src=\"https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1624092003l/52702097._SY75_.jpg\" /><\/a>\n          <\/div>\n          <div class=\"gr_custom_rating_1793585492\">\n            <span class=\" staticStars notranslate\" title=\"it was ok\"><img style=\"width:15px;height:15px\" alt=\"it was ok\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_active.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png\" /><img style=\"width:15px;height:15px\" alt=\"\" src=\"https://s.gr-assets.com/images/layout/gr_flat_red_star_inactive.png\" /><\/span>\n          <\/div>\n          <div class=\"gr_custom_title_1793585492\">\n            <a rel=\"nofollow\" href=\"https://www.goodreads.com/review/show/8972224296?utm_medium=api&amp;utm_source=custom_widget\">Piranesi<\/a>\n          <\/div>\n          <div class=\"gr_custom_author_1793585492\">\n            by <a rel=\"nofollow\" href=\"https://www.goodreads.com/author/show/8842.Susanna_Clarke\">Susanna Clarke<\/a>\n          <\/div>\n      <\/div>\n  <br style=\"clear: both\"/>\n  <center>\n    <a rel=\"nofollow\" href=\"https://www.goodreads.com/\"><img alt=\"goodreads.com\" style=\"border:0\" src=\"https://s.gr-assets.com/images/widget/widget_logo.gif\" /><\/a>\n  <\/center>\n  <noscript>\n    Share <a rel=\"nofollow\" href=\"https://www.goodreads.com/\">book reviews<\/a> and ratings with Quentin, and even join a <a rel=\"nofollow\" href=\"https://www.goodreads.com/group\">book club<\/a> on Goodreads.\n  <\/noscript>\n  <\/div>\n`;

describe("extractWidgetCode", () => {
  const widgetCode = "test";

  test("extracts inside widget_code", () => {
    const text = ` var widget_code = '${widgetCode}'`;
    const result = extractWidgetCode(text);
    expect(result).toBe(widgetCode);
  });

  test("extracts currently reading fixture", () => {
    const result = extractWidgetCode(widgetCurrentlyReadingData);
    expect(result).toBe(expectedWidgetCurrentlyReading);
  });

  test("extracts read fixture", () => {
    const result = extractWidgetCode(widgetReadData);
    expect(result).toBe(expectedWidgetRead);
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
    expect(result).toBe(widgetCode);
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
      "Widget code does not have closing quote",
    );
  });

  test("escaped closing apostrophe", () => {
    const text = String.raw` var widget_code = '\'`;
    expect(() => extractWidgetCode(text)).toThrow(
      "Widget code does not have closing quote",
    );
  });
});
