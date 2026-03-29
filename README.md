# Easy Chess Results

Static prototype for showing a minimal opponents table from a Chess-Results player page.

## What it does

- Accepts a Chess-Results player page URL.
- Tries to fetch the page directly in the browser.
- Extracts the `Player info` section and the opponent table.
- Renders only the compact competitor list.

## Important limitation

Because this app has no backend, direct browser requests to `chess-results.com` or `s3.chess-results.com`
may fail due to CORS. The page includes a fallback textarea where you can paste the full page HTML and
still parse the same data.

## Run

Open [index.html](/Users/alex/Projects/EasyChessResults/index.html) directly in a browser, or serve the
folder with any static server.

Example:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
