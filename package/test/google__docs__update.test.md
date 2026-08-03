# google docs update

Part of the `core` group in `test.suite.md`. Update PATCHes the existing file with a
`multipart/related` body (metadata part plus media part) so Drive re-converts the
source and replaces the Doc's content while keeping the same ID. The Drive upload
endpoint is served by an `aux4/mock` server and `--uploadApiUrl` points at it. Each
test asserts the returned Drive file resource and the `PATCH /files/{id}?uploadType=multipart`
request `docs update` builds — method, bearer token, `multipart/related` content
type, the renamed metadata and the file contents.

## against a local mock API

```beforeAll
aux4 aux4 pkger install aux4/mock
```

```afterAll
aux4 mock stop --port 18996 2>/dev/null
pkill -f "18996" 2>/dev/null
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

### should return the updated Drive file resource

```execute
aux4 mock start --port 18996 >/dev/null 2>&1
sleep 1
aux4 mock stub --port 18996 --method PATCH --path '/files/{id}' --status 200 --body '{"id":"DOC1","name":"Sample","mimeType":"application/vnd.google-apps.document","webViewLink":"https://docs.google.com/document/d/DOC1/edit"}' >/dev/null 2>&1
aux4 google docs update DOC1 --file sample.md --uploadApiUrl http://127.0.0.1:18996/api --tokenFile google-token.json
```

```expect:partial
"id":"DOC1"
```

### should PATCH the Drive upload endpoint with a bearer token

```execute
aux4 mock verify --port 18996 --method PATCH --path /files/DOC1 --header "authorization=Bearer test-access-token"
```

```expect:partial
verify ok
```

### should send the update as multipart/related with the uploadType query

```execute
aux4 mock requests --port 18996 --method PATCH --path /files/DOC1 | aux4 json get --path '$.0.headers.content-type'
aux4 mock requests --port 18996 --method PATCH --path /files/DOC1 | aux4 json get --path '$.0.query.uploadType'
```

```expect:partial
multipart/related
```

### should include the media part header and the file contents

```execute
aux4 mock verify --port 18996 --method PATCH --path /files/DOC1 --body-contains 'Content-Type: text/markdown' --body-contains '# Sample Heading'
```

```expect:partial
verify ok
```

### should rename the document when --title is given

```execute
aux4 mock reset --port 18996 --requests >/dev/null 2>&1
aux4 mock stub --port 18996 --method PATCH --path '/files/{id}' --status 200 --body '{"id":"DOC1","name":"New Name","mimeType":"application/vnd.google-apps.document"}' >/dev/null 2>&1
aux4 google docs update DOC1 --file sample.md --title "New Name" --uploadApiUrl http://127.0.0.1:18996/api --tokenFile google-token.json >/dev/null 2>&1
aux4 mock verify --port 18996 --method PATCH --path /files/DOC1 --body-contains '"name":"New Name"'
```

```expect:partial
verify ok
```

## missing source file

### should fail when --file is not provided

```execute
aux4 google docs update DOC1 --uploadApiUrl http://127.0.0.1:18996/api --tokenFile google-token.json
```

```error:partial
--file is required
```

## without a stored token

### should report that the google provider has no token

```execute
aux4 google docs update DOC1 --file sample.md --uploadApiUrl http://127.0.0.1:18996/api --tokenFile ./no-such-directory/google.json
```

```error:partial
no token found for provider "google"
```
