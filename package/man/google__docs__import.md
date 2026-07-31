#### Description

The `import` command creates a new Google Doc from a local file, letting Google convert the content on the way in. Point it at a Markdown file and you get a fully formatted Doc — headings, bold/italic, lists, tables and links are all preserved — with no batchUpdate calls or index math.

It works by uploading the file to Drive as a `multipart/related` request (a JSON metadata part that sets the target type to a Google Doc, plus the file as the media part). The source format is detected from the file extension: `.md`/`.markdown` → Markdown, `.html` → HTML, `.txt` → plain text.

This is the inverse of `export`: `export` turns a Doc into Markdown, `import` turns Markdown into a Doc.

#### Usage

```bash
aux4 google docs import <file> [--title <title>] [--parent <folderId>]
```

file          Path to the source file (`.md`, `.html` or `.txt`) — required
--title       Title for the new document (default: the file name without its extension)
--parent      Drive folder ID to create the document in (default: My Drive root)
--tokenFile   Where the shared Google OAuth token is stored (default: `~/.aux4.config/.oauth/google.json`, env `AUX4_GOOGLE_TOKEN_FILE`)

#### Examples

Import a Markdown file (title defaults to `report`):

```bash
aux4 google docs import report.md
```

Import with an explicit title, into a specific folder:

```bash
aux4 google docs import notes.md --title "Meeting Notes" --parent 1m0qynhnlInIeB7u0Hs4
```

Round-trip a Doc through Markdown (edit locally, push back as a new Doc):

```bash
aux4 google docs export 1AbC... --output draft.md
# ...edit draft.md...
aux4 google docs import draft.md --title "Draft v2"
```
