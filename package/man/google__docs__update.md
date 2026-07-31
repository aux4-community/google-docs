#### Description

The `update` command replaces an existing Google Doc's content from a local file, **keeping the same document ID and URL** (and therefore its sharing settings and any links to it). This is the difference between `update` and `import`: `import` always creates a brand-new Doc, while `update` overwrites one in place.

It works by PATCHing the file on Drive with a `multipart/related` upload, so Google re-converts the source. The format is detected from the extension (`.md`/`.markdown`, `.html`, `.txt`).

By default the document keeps its current title; pass `--title` to rename it at the same time.

Together with `export` this gives a full edit loop: export a Doc to Markdown, edit it locally, then push it back to the same Doc.

#### Usage

```bash
aux4 google docs update <documentId> --file <path> [--title <title>]
```

documentId    The document ID to update (required)
--file        Path to the source file (`.md`, `.html` or `.txt`) — required
--title       Rename the document (default: leave the current title unchanged)
--tokenFile   Where the shared Google OAuth token is stored (default: `~/.aux4.config/.oauth/google.json`, env `AUX4_GOOGLE_TOKEN_FILE`)

#### Examples

Overwrite a Doc's content, keeping its title and URL:

```bash
aux4 google docs update 1AbC... --file report.md
```

Overwrite and rename in one step:

```bash
aux4 google docs update 1AbC... --file report.md --title "Report (final)"
```

The edit loop — export, edit locally, push back to the same Doc:

```bash
aux4 google docs export 1AbC... --output report.md
# ...edit report.md...
aux4 google docs update 1AbC... --file report.md
```
