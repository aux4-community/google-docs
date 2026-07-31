#### Description

The `get` command retrieves the full structured content of a document by its ID. It performs a GET request against the Google Docs API v1 and returns the complete document resource: the title, the body content (a tree of structural elements such as paragraphs and tables), named styles, lists, inline objects, and the current revision ID.

This is the primary way to read a document programmatically. Combine it with `aux4 json get` to extract specific parts of the structure.

Only read access is required, so this command works with either the `documents` or `documents.readonly` scope.

#### Usage

```bash
aux4 google docs get <documentId> [--tokenFile <path>]
```

documentId   The document ID (found in the document URL between `/d/` and `/edit`)
--tokenFile  Where the shared Google OAuth token is stored (default: `~/.aux4.config/.oauth/google.json`, env `AUX4_GOOGLE_TOKEN_FILE`)

#### Example

```bash
aux4 google docs get 1AbCdEfGhIjKlMnOpQrStUvWxYz
```

```text
{
  "documentId": "1AbCdEfGhIjKlMnOpQrStUvWxYz",
  "title": "Weekly Notes",
  "body": {
    "content": [
      {
        "paragraph": {
          "elements": [
            { "textRun": { "content": "Hello from aux4!\n" } }
          ]
        }
      }
    ]
  },
  "revisionId": "ALm37BW..."
}
```

Extract just the title:

```bash
aux4 google docs get 1AbCdEfGhIjKlMnOpQrStUvWxYz | aux4 json get --path '$.title'
```
