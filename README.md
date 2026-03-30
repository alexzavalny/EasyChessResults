# Easy Chess Results

Static prototype for showing cleaner tournament and player views from Chess-Results pages.

## What it does

- Accepts a Chess-Results tournament ranking URL (`art=1`) or player page URL (`art=9`).
- Tries to fetch the page directly in the browser.
- Extracts either tournament ranking data or the `Player info` section.
- Renders a compact ranking table or opponent list.

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
