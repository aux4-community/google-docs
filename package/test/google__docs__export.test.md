# google docs export

Part of the `core` group in `test.suite.md`. Export runs through the Drive API, so
the Drive export endpoint is replaced by a local echo server and `--driveApiUrl`
points at it. Each test writes the echoed request to a file and asserts the method,
path and `mimeType` that `docs export` builds for the chosen `--format`.

## against a local mock API

```beforeAll
nohup node mock-echo.js 18994 >/dev/null 2>&1 &
for i in $(seq 1 40); do curl -s -o /dev/null http://127.0.0.1:18994/ 2>/dev/null && break; sleep 0.25; done
```

```afterAll
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

### should export markdown by default via the Drive export endpoint

```execute
aux4 google docs export DOC1 --driveApiUrl http://127.0.0.1:18994 --output exp.out --tokenFile google-token.json && cat exp.out
```

```expect:partial
"method": "GET"
```

```expect:partial
"path": "/files/DOC1/export?mimeType=text%2Fmarkdown"
```

```expect:partial
"authorization": "Bearer test-access-token"
```

### should map --format txt to text/plain

```execute
aux4 google docs export DOC1 --format txt --driveApiUrl http://127.0.0.1:18994 --output exp.out --tokenFile google-token.json && cat exp.out
```

```expect:partial
"path": "/files/DOC1/export?mimeType=text%2Fplain"
```

### should map --format docx to the wordprocessingml mime type

```execute
aux4 google docs export DOC1 --format docx --driveApiUrl http://127.0.0.1:18994 --output exp.out --tokenFile google-token.json && cat exp.out
```

```expect:partial
"path": "/files/DOC1/export?mimeType=application%2Fvnd.openxmlformats-officedocument.wordprocessingml.document"
```

## unsupported format

### should reject an unknown format with a clear error

```execute
aux4 google docs export DOC1 --format xml --driveApiUrl http://127.0.0.1:18994 --output exp.out --tokenFile google-token.json
```

```error:partial
Unsupported format 'xml'
```
