# google docs

Part of the optional `integration` group in `test.suite.md`. These tests talk to the
real Google Docs API, so they need a completed `aux4 google auth login` — a Google
Cloud OAuth Desktop client plus a human approving the consent screen in a browser.
They only run when asked for explicitly:

```bash
aux4 test run --group integration
```

Set `DOCS_DOCUMENT_ID` to a document the authenticated account can read.

```timeout
15000
```

## create

### should create a new document and return its id

```execute
aux4 google docs create --title "aux4 integration test" | aux4 json get --path '$.documentId'
```

```expect:partial
*?
```

## get

### should return the document title and body

```execute
aux4 google docs get ${DOCS_DOCUMENT_ID}
```

```expect:partial
"documentId"
```

```expect:partial
"body"
```

## append

### should append text via batchUpdate

```execute
aux4 google docs append ${DOCS_DOCUMENT_ID} --text "
Appended by the aux4 integration test."
```

```expect:partial
"documentId"
```

## batch-update

### should apply a raw insertText request

```execute
aux4 google docs batch-update ${DOCS_DOCUMENT_ID} --requests '[{"insertText":{"endOfSegmentLocation":{},"text":"\nBatch update line.\n"}}]'
```

```expect:partial
"documentId"
```
