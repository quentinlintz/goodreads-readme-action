import { SortChoice } from "./ordering.js";

export const fetchShelf = async (
  accountId: string,
  shelf: string,
): Promise<string> => {
  const url = new URL(`https://www.goodreads.com/review/list_rss/${accountId}`);
  url.searchParams.set("shelf", shelf);

  const response = await fetch(url, {
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data: string = await response.text();
  return data;
};

const translateSortChoice = (sortChoice: SortChoice): string => {
  switch (sortChoice) {
    case SortChoice.DateAdded:
      return "date_added";
    case SortChoice.DateRead:
      return "date_read";
  }
};

export const fetchWidgetShelf = async (
  accountId: string,
  widgetId: string,
  shelf: string,
  sort: SortChoice,
  limit: number,
): Promise<string> => {
  const url = new URL(
    `https://www.goodreads.com/review/custom_widget/${accountId}.goodreads-readme-action?cover_position=left&cover_size=small&show_author=1&show_cover=1&show_rating=1&show_review=1&show_tags=1&show_title=1&widget_bg_color=FFFFFF&widget_bg_transparent=&widget_border_width=1&widget_text_color=000000&widget_title_size=medium&widget_width=medium`,
  );
  url.searchParams.set("widget_id", widgetId);
  url.searchParams.set("shelf", shelf);
  url.searchParams.set("order", "d"); // Modifying order is not supported by the action right now
  url.searchParams.set("sort", translateSortChoice(sort));
  url.searchParams.set("num_books", String(limit));

  const response = await fetch(url, {
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data: string = await response.text();
  return data;
};
