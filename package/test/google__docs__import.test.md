# google docs import

Part of the `core` group in `test.suite.md`. Import uploads a source file to the
Drive upload endpoint as `multipart/related` (a JSON metadata part plus the media
part) so Drive converts it into a Doc. The Drive upload endpoint is served by an
`aux4/mock` server and `--uploadApiUrl` points at it. Each test asserts the created
Drive file resource the command returns and the `POST /files?uploadType=multipart`
request `docs import` builds — method, bearer token, `multipart/related` content
type, the Doc metadata part and the file's contents.

## against a local mock API

```beforeAll
aux4 aux4 pkger install aux4/mock
```

```afterAll
aux4 mock stop --port 18995 2>/dev/null
pkill -f "18995" 2>/dev/null
rm -f sample.md
```

```file:google-token.json
{
  "clientId": "test-client",
  "clientSecret": "test-secret",
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth",
  "tokenUrl": "https://oauth2.googleapis.com/token",
  "scopes": "https://www.googleapis.com/auth/drive.file",
  "accessToken": "test-access-token",
  "refreshToken": "test-refresh-token",
  "expiresAt": "2099-12-31T23:59:59Z"
}
```

```file:sample.md
# Sample Heading

Some **bold** text.
```

### should return the created Drive file resource

```execute
aux4 mock start --port 18995 >/dev/null 2>&1
sleep 1
aux4 mock stub --port 18995 --method POST --path /files --status 200 --body '{"id":"1AbCdEfGhIjKlMnOpQrStUvWxYz","name":"My Imported Doc","mimeType":"application/vnd.google-apps.document","webViewLink":"https://docs.google.com/document/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit"}' >/dev/null 2>&1
aux4 google docs import sample.md --title "My Imported Doc" --uploadApiUrl http://127.0.0.1:18995/api --tokenFile google-token.json
```

```expect:partial
"name":"My Imported Doc"
```

### should POST the Drive upload endpoint with a bearer token

```execute
aux4 mock verify --port 18995 --method POST --path /files --header "authorization=Bearer test-access-token"
```

```expect:partial
verify ok
```

### should send the upload as multipart/related with the uploadType query

```execute
aux4 mock requests --port 18995 --method POST --path /files | aux4 json get --path '$.0.headers.content-type'
aux4 mock requests --port 18995 --method POST --path /files | aux4 json get --path '$.0.query.uploadType'
```

```expect:partial
multipart/related
```

### should send the Doc metadata part with the title and the document mimeType

```execute
aux4 mock verify --port 18995 --method POST --path /files --body-contains '"name":"My Imported Doc"' --body-contains '"mimeType":"application/vnd.google-apps.document"'
```

```expect:partial
verify ok
```

### should include the media part header and the file contents

```execute
aux4 mock verify --port 18995 --method POST --path /files --body-contains 'Content-Type: text/markdown' --body-contains '# Sample Heading'
```

```expect:partial
verify ok
```

### should default the title to the file name without extension

```execute
aux4 mock reset --port 18995 --requests >/dev/null 2>&1
aux4 mock stub --port 18995 --method POST --path /files --status 200 --body '{"id":"1AbCdEfGhIjKlMnOpQrStUvWxYz","name":"sample","mimeType":"application/vnd.google-apps.document"}' >/dev/null 2>&1
aux4 google docs import sample.md --uploadApiUrl http://127.0.0.1:18995/api --tokenFile google-token.json >/dev/null 2>&1
aux4 mock verify --port 18995 --method POST --path /files --body-contains '"name":"sample"'
```

```expect:partial
verify ok
```

## without a stored token

### should report that the google provider has no token

```execute
aux4 google docs import sample.md --uploadApiUrl http://127.0.0.1:18995/api --tokenFile ./no-such-directory/google.json
```

```error:partial
no token found for provider "google"
```
