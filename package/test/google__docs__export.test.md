# google docs export

Part of the `core` group in `test.suite.md`. Export runs through the Drive API, so
the Drive export endpoint is served by an `aux4/mock` server and `--driveApiUrl`
points at it. The command writes the stubbed export body to `--output`, and each test
asserts the `GET /files/{id}/export` request and the `mimeType` query parameter that
`docs export` builds for the chosen `--format`.

## against a local mock API

```beforeAll
aux4 aux4 pkger install aux4/mock
```

```afterAll
aux4 mock stop --port 18994 2>/dev/null
pkill -f "18994" 2>/dev/null
rm -f exp.out
```

```file:google-token.json
{
  "clientId": "test-client",
  "clientSecret": "test-secret",
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth",
  "tokenUrl": "https://oauth2.googleapis.com/token",
  "scopes": "https://www.googleapis.com/auth/documents",
  "accessToken": "test-access-token",
  "refreshToken": "test-refresh-token",
  "expiresAt": "2099-12-31T23:59:59Z"
}
```

### should export markdown by default and write the body to the output file

```execute
aux4 mock start --port 18994 >/dev/null 2>&1
sleep 1
aux4 mock stub --port 18994 --method GET --path /files/{id}/export --status 200 --contentType text/markdown --body '# Exported Doc

First paragraph of the exported document.' >/dev/null 2>&1
aux4 google docs export DOC1 --driveApiUrl http://127.0.0.1:18994/api --output exp.out --tokenFile google-token.json && cat exp.out
```

```expect:partial
# Exported Doc
```

### should GET the Drive export endpoint with a bearer token and text/markdown

```execute
aux4 mock verify --port 18994 --method GET --path /files/DOC1/export --header "authorization=Bearer test-access-token"
aux4 mock requests --port 18994 --method GET --path /files/DOC1/export | aux4 json get --path '$.0.query.mimeType'
```

```expect:partial
text/markdown
```

### should map --format txt to text/plain

```execute
aux4 mock reset --port 18994 --requests >/dev/null 2>&1
aux4 google docs export DOC1 --format txt --driveApiUrl http://127.0.0.1:18994/api --output exp.out --tokenFile google-token.json >/dev/null 2>&1
aux4 mock requests --port 18994 --method GET --path /files/DOC1/export | aux4 json get --path '$.0.query.mimeType'
```

```expect
"text/plain"
```

### should map --format docx to the wordprocessingml mime type

```execute
aux4 mock reset --port 18994 --requests >/dev/null 2>&1
aux4 google docs export DOC1 --format docx --driveApiUrl http://127.0.0.1:18994/api --output exp.out --tokenFile google-token.json >/dev/null 2>&1
aux4 mock requests --port 18994 --method GET --path /files/DOC1/export | aux4 json get --path '$.0.query.mimeType'
```

```expect
"application/vnd.openxmlformats-officedocument.wordprocessingml.document"
```

## unsupported format

### should reject an unknown format with a clear error

```execute
aux4 google docs export DOC1 --format xml --driveApiUrl http://127.0.0.1:18994/api --output exp.out --tokenFile google-token.json
```

```error:partial
Unsupported format 'xml'
```
