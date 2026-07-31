#### Description

The `create` command creates a new, empty Google Docs document with the given title. It POSTs to the Documents endpoint of the Google Docs API v1 and returns the full document resource, including the generated `documentId` that later commands (`get`, `append`, `batch-update`) use to reference the document.

The new document is owned by the authenticated account and is created empty — use `append` or `batch-update` to add content.

#### Usage

```bash
aux4 google docs create [--title <title>] [--tokenFile <path>]
```

--title      Title of the new document
--tokenFile  Where the shared Google OAuth token is stored (default: `~/.aux4.config/.oauth/google.json`, env `AUX4_GOOGLE_TOKEN_FILE`)

#### Example

```bash
aux4 google docs create --title "Weekly Notes"
```

```text
{
  "documentId": "1AbCdEfGhIjKlMnOpQrStUvWxYz",
  "title": "Weekly Notes",
  "body": {
    "content": [
      {
        "endIndex": 1,
        "sectionBreak": { "sectionStyle": {} }
      }
    ]
  },
  "revisionId": "ALm37BW...",
  "documentStyle": {}
}
```

Capture the document ID for use in later commands:

```bash
aux4 google docs create --title "Weekly Notes" | aux4 json get --path '$.documentId'
```
