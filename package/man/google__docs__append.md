#### Description

The `append` command adds text to the very end of a document. It is a convenience wrapper around the Google Docs `batchUpdate` endpoint: it builds a single `insertText` request that targets the end of the document body (`endOfSegmentLocation`) and POSTs it to the API.

To start the appended text on a new paragraph, include a leading newline in the `--text` value. The text is inserted verbatim — newline characters in the value become new paragraphs in the document.

For inserting at a specific position, replacing text, or applying formatting, use `batch-update` instead.

#### Usage

```bash
aux4 google docs append <documentId> [--text <text>] [--tokenFile <path>]
```

documentId   The document ID
--text       The text to append to the end of the document
--tokenFile  Where the shared Google OAuth token is stored (default: `~/.aux4.config/.oauth/google.json`, env `AUX4_GOOGLE_TOKEN_FILE`)

#### Example

```bash
aux4 google docs append 1AbCdEfGhIjKlMnOpQrStUvWxYz --text "Hello from aux4!"
```

```text
{
  "documentId": "1AbCdEfGhIjKlMnOpQrStUvWxYz",
  "replies": [{}],
  "writeControl": { "requiredRevisionId": "ALm37BW..." }
}
```

Append a new paragraph by leading with a newline:

```bash
aux4 google docs append 1AbCdEfGhIjKlMnOpQrStUvWxYz --text "
A brand new paragraph."
```

Under the hood this sends the following request body:

```json
{
  "requests": [
    {
      "insertText": {
        "endOfSegmentLocation": {},
        "text": "Hello from aux4!"
      }
    }
  ]
}
```
