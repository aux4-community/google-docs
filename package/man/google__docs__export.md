#### Description

The `export` command downloads a Google Doc converted to another format and writes it to a file. Google Docs are native Google objects, so exporting is how you get their content as Markdown, plain text, HTML, PDF or a Word document.

Export is a Drive operation (`files.export`), so it runs against the Drive API rather than the Docs API.

Supported `--format` values:

| `--format` | MIME type | Notes |
|------------|-----------|-------|
| `md`  | `text/markdown` | preserves structure (headings, bold, lists, tables, links) — the default |
| `txt` | `text/plain` | raw text, formatting stripped. ⚠️ Google prepends a UTF-8 BOM (`﻿`) |
| `html`| `text/html` | full styled HTML |
| `pdf` | `application/pdf` | |
| `docx`| `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | Microsoft Word |

An unrecognized format fails fast with a clear message rather than a cryptic Drive error.

#### Usage

```bash
aux4 google docs export <documentId> [--format md|txt|html|pdf|docx] --output <file>
```

documentId    The document ID to export (required)
--format      Export format (default: `md`)
--output      Path to write the exported file (required)
--tokenFile   Where the shared Google OAuth token is stored (default: `~/.aux4.config/.oauth/google.json`, env `AUX4_GOOGLE_TOKEN_FILE`)

#### Examples

Export to Markdown (default):

```bash
aux4 google docs export 1AbC... --output article.md
```

Export to PDF and to Word:

```bash
aux4 google docs export 1AbC... --format pdf  --output doc.pdf
aux4 google docs export 1AbC... --format docx --output doc.docx
```
