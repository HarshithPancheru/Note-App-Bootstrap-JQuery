# Aurora Notes

A beautiful, responsive notes application built with HTML, CSS, Bootstrap and jQuery. Notes are stored locally in your browser (localStorage). This is a single-file frontend app — just open `index.html` in a browser.

## Features

- Create notes with title, content and comma-separated tags
- View-only notes in the grid (edit/delete via UI was removed in this build)
- Search notes by title, content or tags
- Filter by tags and sort (newest/oldest/title)
- Export notes to JSON and import notes from JSON
- Dark-only theme (light mode removed)
- Local persistence via localStorage

## How to run

1. Open `index.html` in your browser (double-click or `File -> Open`).
2. Use the editor on the left to create notes. Notes are view-only once saved — recreate if you want to change them.
3. Use Export / Import in the top-right to backup or restore notes.

## Files

- `index.html` — main HTML file (uses CDN for Bootstrap & jQuery)
- `css/style.css` — custom styles
- `js/app.js` — application logic (jQuery)

## Notes on privacy & storage

All notes are saved in your browser's localStorage under the key `aurora_notes_v1`. They never leave your machine unless you export and share the JSON file.

Enjoy! ✨
