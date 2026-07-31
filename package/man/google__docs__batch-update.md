#### Description

The `batch-update` command applies a raw array of Google Docs [request objects](https://developers.google.com/docs/api/reference/rest/v1/documents/request) to a document in a single atomic operation. It is the full-power editing command — every structural and styling change the Google Docs API supports is expressed as a request in this array.

Pass the `--requests` value as a raw JSON array string. The array is wrapped as `{"requests": [...]}` and POSTed to the document's `:batchUpdate` endpoint. Requests are validated and applied in order; if any request is invalid, none are applied.

Common request types include `insertText`, `deleteContentRange`, `replaceAllText`, `updateTextStyle`, `updateParagraphStyle`, `insertTable`, and `createParagraphBullets`.

#### Usage

```bash
aux4 google docs batch-update <documentId> [--requests <jsonArray>] [--tokenFile <path>]
```

documentId   The document ID
--requests   A raw JSON array of Google Docs batchUpdate request objects
--tokenFile  Where the shared Google OAuth token is stored (default: `~/.aux4.config/.oauth/google.json`, env `AUX4_GOOGLE_TOKEN_FILE`)

#### Example

Insert text at the beginning of the document body:

```bash
aux4 google docs batch-update 1AbCdEfGhIjKlMnOpQrStUvWxYz --requests '[{"insertText":{"location":{"index":1},"text":"Title\n"}}]'
```

```text
{
  "documentId": "1AbCdEfGhIjKlMnOpQrStUvWxYz",
  "replies": [{}],
  "writeControl": { "requiredRevisionId": "ALm37BW..." }
}
```

Replace all occurrences of a placeholder:

```bash
aux4 google docs batch-update 1AbCdEfGhIjKlMnOpQrStUvWxYz --requests '[{"replaceAllText":{"containsText":{"text":"{{name}}","matchCase":true},"replaceText":"Sally"}}]'
```

Apply several requests at once — insert a heading then bold it:

```bash
aux4 google docs batch-update 1AbCdEfGhIjKlMnOpQrStUvWxYz --requests '[{"insertText":{"location":{"index":1},"text":"Overview\n"}},{"updateTextStyle":{"range":{"startIndex":1,"endIndex":9},"textStyle":{"bold":true},"fields":"bold"}}]'
```
