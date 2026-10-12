# Goodreads README Action

Automatically update your profile README with any of your public [Goodreads](https://goodreads.com) shelves!

## Why

This action is for developers who read a lot (like myself). It uses the RSS feed associated with a Goodreads profile to pull shelf data and replaces _part_ of your profile README automatically. It's currently experimental.

See my [GitHub profile](https://github.com/quentinlintz) for a working example!

## Setup

### Full example

`README.md`

```markdown
### Currently Reading

<!-- GOODREADS-CURRENTLY-READING:START -->
<!-- GOODREADS-CURRENTLY-READING:END -->

### Recently Read

<!-- GOODREADS-READ:START -->
<!-- GOODREADS-READ:END -->
```

`.github/workflows/rss-workflow.yml`

```yml
name: Sync Goodreads

on:
  schedule:
    - cron: "0 0 * * 0" # Weekly, Sundays at 00:00 UTC
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: false

jobs:
  update-reading:
    name: Update README with Goodreads shelves
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Pull currently reading
        uses: quentinlintz/goodreads-readme-action@v1.0.0
        with:
          goodreads-user-id: 160841838 # Replace this with your Goodreads profile ID
          shelf: currently-reading
          section: GOODREADS-CURRENTLY-READING
          sort: date-added
          show-rating: false
          max-books: 5

      - name: Pull recently read
        uses: quentinlintz/goodreads-readme-action@v1.0.0
        with:
          goodreads-user-id: 160841838 # Replace this with your Goodreads profile ID
          shelf: read
          section: GOODREADS-READ
          sort: date-read
          show-rating: true
          max-books: 5

      - name: Commit Goodreads shelves
        run: |
          if [ -n "$(git status --porcelain README.md)" ]; then
            git config user.name "goodreads-books-bot"
            git config user.email "goodreads-books-bot@example.com"
            git add README.md
            git commit -m "Render Goodreads shelves"
            git push
          fi
```

### Steps

- Go to your Goodreads profile. The numeric part of the URL is your Goodreads profile ID. Example: `https://www.goodreads.com/user/show/160841838-quentin-lintz`, mine is "160841838".

- Add matching HTML-comment markers to your GitHub profile's README.md for replacing.

- Add `quentinlintz/goodreads-readme-action@v1.0.0` to a workflow in your GitHub profile repo. Save it under `.github/workflows/`.

- When you've pushed this, trigger the workflow from the Actions tab and your README will be updated.

## Inputs

| Name              | Description                              | Accepts                 | Default           |
| ----------------- | ---------------------------------------- | ----------------------- | ----------------- |
| goodreads-user-id | your profile ID                          | number                  | required          |
| readme-path       | a file path, including subdirectories    | string                  | README.md         |
| shelf             | your Goodreads shelf to target           | string                  | currently-reading |
| section           | the name shared by the START/END markers | string                  | GOODREADS-LIST    |
| sort              | newest first, with missing dates last    | date-added or date-read | date-added        |
| show-rating       | stars that represent your book ratings   | boolean                 | false             |
| max-books         | limit to the number of books rendered    | positive integer        | 10                |

## Behavior

Here's a selection of RSS examples and their rendered output for a visual of how this action should behave. I'm using part of my [Read](https://www.goodreads.com/review/list_rss/160841838?shelf=read) shelf's RSS response as an example here. These are by default sorted by most recently added first (on top).

### Multiple books

Shelf RSS:

```xml
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <item>
      <title>A Gentleman in Moscow</title>
      <book_id>45695810</book_id>
      <author_name>Amor Towles</author_name>
      <user_rating>3</user_rating>
      <user_read_at><![CDATA[Tue, 1 Sep 2026 00:00:00 +0000]]></user_read_at>
      <user_date_added><![CDATA[Sun, 06 Sep 2026 14:21:57 -0700]]></user_date_added>
    </item>
    <item>
      <title>Great Songwriting Techniques</title>
      <book_id>39704081</book_id>
      <author_name>Jack Perricone</author_name>
      <user_rating></user_rating>
      <user_read_at><![CDATA[Sun, 30 Aug 2026 00:00:00 +0000]]></user_read_at>
      <user_date_added><![CDATA[Sun, 30 Aug 2026 16:33:46 -0700]]></user_date_added>
    </item>
  </channel>
</rss>
```

Profile README:

```markdown
<!-- GOODREADS-LIST:START -->

- [A Gentleman in Moscow](https://www.goodreads.com/book/show/45695810), Amor Towles ★★★☆☆ (3/5)
- [Great Songwriting Techniques](https://www.goodreads.com/book/show/39704081), Jack Perricone

<!-- GOODREADS-LIST:END -->
```

The stars are omitted if the book does not have a user rating or if the user hasn't enabled it. The default ordering is most-recently added at the top.

Goodreads has [added quarter- and half-star ratings](https://www.goodreads.com/blog/show/3199), but I've observed their RSS may not support them yet (as of October 12, 2026). Filled stars show the whole-number portion, while the numeric score preserves the exact RSS rating. The action supports fractional values whenever RSS supplies them.

### Empty shelf

Shelf RSS:

```xml
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
  </channel>
</rss>
```

Profile README:

```markdown
<!-- GOODREADS-LIST:START -->

Shelf is empty
<!-- GOODREADS-LIST:END -->
```

### Bad input

If we make a request with an invalid...

- **malformed goodreads id**: fail validation
- **shelf name**: Goodreads substitutes the shelf with your "read" shelf, but we don't detect this and _may pass_ the read shelf through.

Validation and request failure report an error and preserve your README section.

## Credits

Written by Quentin Lintz, by hand. AI produced no parts of this code.

Inspired by [zwacky/goodreads-profile-workflow](https://github.com/zwacky/goodreads-profile-workflow).
