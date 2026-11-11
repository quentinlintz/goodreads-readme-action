# Fixtures

## Widget

Test scenarios with URL/widget_code inputs and expected markdown outputs. These are reproduction URLs.

### Currently reading

URL: <https://www.goodreads.com/review/custom_widget/160841838.Quentin's%20bookshelf:%20currently-reading?cover_position=left&cover_size=small&num_books=5&order=a&shelf=currently-reading&show_author=1&show_cover=1&show_rating=1&show_review=1&show_tags=1&show_title=1&sort=date_added&widget_bg_color=FFFFFF&widget_bg_transparent=&widget_border_width=1&widget_id=1794319661&widget_text_color=000000&widget_title_size=medium&widget_width=medium>
Input: ./widget-currently-reading.txt
HTML: ./widget-currently-reading.expected.html
Expected output: ./widget-currently-reading.expected.md

- date-added ascending
- limit 5

### Read

URL: <https://www.goodreads.com/review/custom_widget/160841838.Quentin's%20bookshelf:%20read?cover_position=left&cover_size=small&num_books=5&order=d&shelf=read&show_author=1&show_cover=1&show_rating=1&show_review=1&show_tags=1&show_title=1&sort=date_read&widget_bg_color=FFFFFF&widget_bg_transparent=&widget_border_width=1&widget_id=1794319865&widget_text_color=000000&widget_title_size=medium&widget_width=medium>
Input: ./widget-read-dr-desc.txt
HTML: ./widget-read-dr-desc.expected.html
Expected output: ./widget-read-dr-desc.expected.md

- date-read descending
- limit 5

### Read (date-read, ascending)

URL: <https://www.goodreads.com/review/custom_widget/160841838.Quentin's%20bookshelf:%20read?cover_position=left&cover_size=small&num_books=5&order=a&shelf=read&show_author=1&show_cover=1&show_rating=1&show_review=1&show_tags=1&show_title=1&sort=date_read&widget_bg_color=FFFFFF&widget_bg_transparent=&widget_border_width=1&widget_id=1794319839&widget_text_color=000000&widget_title_size=medium&widget_width=medium>
Input: ./widget-read-dr-asc.txt

- date-read ascending
- limit 5

### Valid empty

URL: <https://www.goodreads.com/review/custom_widget/160841838.Quentin's%20bookshelf:%20did-not-finish?cover_position=left&cover_size=small&num_books=5&order=a&shelf=did-not-finish&show_author=1&show_cover=1&show_rating=1&show_review=1&show_tags=1&show_title=1&sort=date_added&widget_bg_color=FFFFFF&widget_bg_transparent=&widget_border_width=1&widget_id=1794365618&widget_text_color=000000&widget_title_size=medium&widget_width=medium>
Input: ./widget-valid-empty.txt
HTML: ./widget-valid-empty.expected.html

- date-added ascending
- limit 5

## RSS

Test scenarios with RSS XML inputs and expected markdown outputs.

### Currently reading

Input: ./currently-reading.xml
Expected output: ./currently-reading.expected.md

- date-added descending
- ratings enabled (none)
- limit 10

### Read

Input: ./read.xml
Expected output: ./read.expected.md

- date-read descending
- ratings enabled
- limit 6

### Single book

Input: ./single-book.xml
Expected output: ./single-book.expected.md

- date-added descending
- ratings disabled
- limit 1

### Valid empty

Input: ./valid-empty.xml
Expected output: ./valid-empty.expected.md

The shelf is empty and should clear old books in the README.

### Malformed

Input: ./malformed.xml

The XML parsing fails and the README remains unchanged.

### Not RSS

Input: ./not-rss.xml

The XML response is not RSS and the README remains unchanged.
