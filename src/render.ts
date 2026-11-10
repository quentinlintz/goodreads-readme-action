const escapeMarkdownText = (text: string): string => {
  return text
    .replace(/\r\n?|\n/g, " ")
    .replace(/([\\`*_{}[\]()#+\-.!<>&~|])/g, "\\$1")
    .trim();
};

export type RenderableBook = {
  title: string;
  authorName: string;
  userRating: number;
  url: string;
};

export const renderShelf = (
  shelf: RenderableBook[],
  showRating: boolean = false,
): string => {
  if (shelf.length === 0) {
    return "Shelf is empty";
  }

  const lines: string[] = [];
  shelf.forEach((book) => {
    const title = escapeMarkdownText(book.title);
    const authorName = escapeMarkdownText(book.authorName);
    const roundedRating = Math.floor(book.userRating);
    const stars =
      showRating && book.userRating !== 0
        ? "★".repeat(roundedRating) +
          "☆".repeat(5 - roundedRating) +
          ` (${book.userRating}/5)`
        : "";
    lines.push(`- [${title}](${book.url}), ${authorName} ${stars}`.trim());
  });

  return lines.join("\n");
};
