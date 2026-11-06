import JSON5 from "json5";

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
