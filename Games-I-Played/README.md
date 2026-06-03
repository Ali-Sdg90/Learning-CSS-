# Games I Played — UI & Tools

What I added

- A fresh, responsive UI in `index.html` driven by the existing `games.json`.
- Improved `style.css` and `script.js` with search, client-side sort and a nice card layout.
- A Node tool to permanently sort `games.json` by title: `tools/sort-games.js`.

Quick usage

1. Open the UI in a browser. For best results serve the folder (e.g. using `npx http-server` or Live Server) so `fetch('./games.json')` works.

2. To permanently sort the JSON file by title (the `game` field), run:

```bash
cd Games-I-Played
npm install    # optional, not required for the simple script
npm run sort-games
```

Notes

- The Node script sorts by the `game` field (treating it as the title). It writes the sorted array back to `games.json` with 4-space formatting.
- I backed up your original `index.html` to `index.html.bak`.

If you want, I can:

- Add a download/export button to the UI for a sorted JSON snapshot.
- Add unit tests for the Node sorter.
