# google docs get

Part of the `core` group in `test.suite.md`. The Google Docs API is replaced by an
`aux4/mock` server, so the command runs against a realistic document resource while
the `GET /documents/{id}` request (path, `Authorization` header and empty body) is
asserted with `aux4 mock verify` and `aux4 mock requests`, without a real document.

## against a local mock API

```beforeAll
aux4 aux4 pkger install aux4/mock
```

```afterAll
aux4 mock stop --port 18991 2>/dev/null
pkill -f "18991" 2>/dev/null
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

### should return the document resource for the requested id

```execute
aux4 mock start --port 18991 >/dev/null 2>&1
sleep 1
aux4 mock stub --port 18991 --method GET --path /documents/{id} --status 200 --body '{"documentId":"${path.id}","title":"Design Doc","body":{"content":[{"paragraph":{"elements":[{"textRun":{"content":"Overview\n"}}]}}]},"revisionId":"ALm37c"}' >/dev/null 2>&1
aux4 google docs get 1AbCdEfGhIjKlMnOpQrStUvWxYz --tokenFile google-token.json --apiUrl http://127.0.0.1:18991/api
```

```expect:partial
"documentId":"1AbCdEfGhIjKlMnOpQrStUvWxYz"
```

### should GET the document resource with a bearer token

```execute
aux4 mock verify --port 18991 --method GET --path /documents/1AbCdEfGhIjKlMnOpQrStUvWxYz --header "authorization=Bearer test-access-token"
```

```expect:partial
verify ok
```

### should send no request body

```execute
aux4 mock requests --port 18991 --method GET --path /documents/1AbCdEfGhIjKlMnOpQrStUvWxYz | aux4 json get --path '$.0.body'
```

```expect
""
```

## without a stored token

### should report that the google provider has no token

```execute
aux4 google docs get 1AbCdEfGhIjKlMnOpQrStUvWxYz --tokenFile ./no-such-directory/google.json --apiUrl http://127.0.0.1:18991/api
```

```error:partial
no token found for provider "google"
```
