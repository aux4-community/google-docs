# community/google-docs

Commands to interact with Google Docs using the Google Docs API v1

This package provides aux4 command wrappers for the [Google Docs API v1](https://developers.google.com/docs/api/reference/rest). It covers creating new documents, reading a document's full structured content, appending text, and applying raw `batchUpdate` requests for advanced edits.

Authentication is handled by [community/google-auth](https://hub.aux4.io/package/community/google-auth), which stores a single OAuth2 token shared by every aux4 Google package.

## Installation

```bash
aux4 aux4 pkger install community/google-docs
```

## Prerequisites

Authenticate once with `community/google-auth`. The scopes are resolved from the installed Google service packages, so no `--scopes` flag is needed:

```bash
aux4 google auth login
```

This package requests `https://www.googleapis.com/auth/documents`, which allows creating, reading, and editing documents. If you only need read access, `aux4 google auth login --readonly true` requests `https://www.googleapis.com/auth/documents.readonly` instead, which is enough for the `get` command.

Check the current state at any time:

```bash
aux4 google auth status
```

## Quick Start

Create a new document:

```bash
aux4 google docs create --title "My Report"
```

Read a document by ID:

```bash
aux4 google docs get 1AbCdEfGhIjKlMnOpQrStUvWxYz
```

Append text to the end of a document:

```bash
aux4 google docs append 1AbCdEfGhIjKlMnOpQrStUvWxYz --text "Hello from aux4!"
```

## create — new documents

Create an empty document with a title:

```bash
aux4 google docs create --title "Weekly Notes"
```

The response is the newly created document resource, including its `documentId`. Capture the ID to use in later commands:

```bash
aux4 google docs create --title "Weekly Notes" | aux4 json get --path '$.documentId'
```

## get — read a document

Retrieve the full structured content of a document by its ID:

```bash
aux4 google docs get 1AbCdEfGhIjKlMnOpQrStUvWxYz
```

The response includes the document title, body content, named styles, and revision ID. Extract just the title:

```bash
aux4 google docs get 1AbCdEfGhIjKlMnOpQrStUvWxYz | aux4 json get --path '$.title'
```

The document ID is the long identifier in the document URL:

```text
https://docs.google.com/document/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit
                                    ^-------- documentId --------^
```

## append — add text

Append text to the very end of a document. Include a leading newline in the text to start a new paragraph:

```bash
aux4 google docs append 1AbCdEfGhIjKlMnOpQrStUvWxYz --text "
A new paragraph of content."
```

This is a convenience wrapper around the `batchUpdate` endpoint that inserts an `insertText` request at the end of the document body.

## batch-update — advanced edits

For anything beyond appending text — inserting at a specific index, replacing text, formatting, tables, lists, and more — pass a raw JSON array of [Google Docs request objects](https://developers.google.com/docs/api/reference/rest/v1/documents/request) to `batch-update`:

```bash
aux4 google docs batch-update 1AbCdEfGhIjKlMnOpQrStUvWxYz --requests '[{"insertText":{"location":{"index":1},"text":"Title\n"}}]'
```

Replace all occurrences of a phrase:

```bash
aux4 google docs batch-update 1AbCdEfGhIjKlMnOpQrStUvWxYz --requests '[{"replaceAllText":{"containsText":{"text":"{{name}}","matchCase":true},"replaceText":"Sally"}}]'
```

The array is wrapped as `{"requests": [...]}` and POSTed to the document's `:batchUpdate` endpoint. Requests are applied atomically in order.

## export — download as Markdown, text, HTML, PDF or Word

Export a document to a file, converting on the way out:

```bash
aux4 google docs export 1AbCdEfGhIjKlMnOpQrStUvWxYz --output article.md          # Markdown (default)
aux4 google docs export 1AbCdEfGhIjKlMnOpQrStUvWxYz --format pdf  --output doc.pdf
aux4 google docs export 1AbCdEfGhIjKlMnOpQrStUvWxYz --format docx --output doc.docx
```

`--format` accepts `md`, `txt`, `html`, `pdf` or `docx` (default `md`); an unknown value fails fast with a clear message. Markdown export preserves structure (headings, bold, lists, tables, links), which makes it the clean way to move a Doc into a Markdown pipeline.

> Note: `txt` export carries a leading UTF-8 BOM (`﻿`) that Google adds — strip it if your consumer doesn't handle BOMs (`md`, `html`, `pdf` and `docx` do not have one).

Export is a Drive operation, so it uses the Drive API base URL (overridable via `DRIVE_API_URL`).

## import — create a Doc from Markdown, HTML or text

The inverse of `export`: turn a local file into a fully-formatted Google Doc, letting Google convert it on the way in (headings, bold/italic, lists, tables and links are preserved — no batchUpdate or index math):

```bash
aux4 google docs import report.md                                  # title defaults to "report"
aux4 google docs import notes.md --title "Meeting Notes" --parent 1m0qynhnl...
```

The source format is detected from the extension (`.md`/`.markdown`, `.html`, `.txt`, `.docx`, `.odt`, `.rtf`). Under the hood it uploads the file to Drive as a `multipart/related` request with the target type set to a Google Doc.

## update — overwrite an existing Doc's content

`import` always creates a **new** Doc. To overwrite an **existing** one in place — keeping its document ID, URL and sharing — use `update`:

```bash
aux4 google docs update 1AbC... --file report.md               # keeps the current title
aux4 google docs update 1AbC... --file report.md --title "Final"  # overwrite and rename
```

Same file formats as `import` (`.md`, `.html`, `.txt`, `.docx`, `.odt`, `.rtf` — detected from the extension). This gives a true edit loop: **export → edit locally → update the same Doc**:

```bash
aux4 google docs export 1AbC... --output report.md   # ...edit report.md... then:
aux4 google docs update 1AbC... --file report.md
```

## Finding your Document ID

The document ID is the string between `/d/` and `/edit` in a Google Docs URL:

```text
https://docs.google.com/document/d/<documentId>/edit
```

You can also capture it from the `create` command's response.

## Environment Variables

- `AUX4_GOOGLE_TOKEN_FILE` — where the shared Google OAuth token lives. Defaults to `~/.aux4.config/.oauth/google.json`, the same location `aux4 google auth login` writes to, so it normally needs no setting.

For the optional `integration` test group, set `DOCS_DOCUMENT_ID` to a document the authenticated account can read.

## License

MIT — See [LICENSE](./LICENSE) for details.
