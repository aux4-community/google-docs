# google docs append

Part of the `core` group in `test.suite.md`. The Google Docs API is replaced by an
`aux4/mock` server, so the command runs against a realistic `batchUpdate` reply while
the outgoing `POST /documents/{id}:batchUpdate` request — including the generated
`insertText` requests array — is asserted with `aux4 mock verify`, without touching a
real document.

## against a local mock API

```beforeAll
aux4 aux4 pkger install aux4/mock
```

```afterAll
aux4 mock stop --port 18992 2>/dev/null
pkill -f "18992" 2>/dev/null
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

### should return the batchUpdate reply

```execute
aux4 mock start --port 18992 >/dev/null 2>&1
sleep 1
aux4 mock stub --port 18992 --method POST --path /documents/{id}:batchUpdate --status 200 --body '{"documentId":"${path.id}","replies":[{}],"writeControl":{"requiredRevisionId":"ALm37d"}}' >/dev/null 2>&1
aux4 google docs append 1AbCdEfGhIjKlMnOpQrStUvWxYz --text "Hello from aux4!" --tokenFile google-token.json --apiUrl http://127.0.0.1:18992/api
```

```expect:partial
"documentId":"1AbCdEfGhIjKlMnOpQrStUvWxYz"
```

### should POST to the batchUpdate endpoint with a bearer token

```execute
aux4 mock verify --port 18992 --method POST --path /documents/1AbCdEfGhIjKlMnOpQrStUvWxYz:batchUpdate --header "authorization=Bearer test-access-token" --header "content-type=application/json"
```

```expect:partial
verify ok
```

### should build the insertText requests array from the text

```execute
aux4 mock verify --port 18992 --method POST --path /documents/1AbCdEfGhIjKlMnOpQrStUvWxYz:batchUpdate --body-contains '"insertText"' --body-contains '"endOfSegmentLocation":{}' --body-contains '"text":"Hello from aux4!"'
```

```expect:partial
verify ok
```

## without a stored token

### should report that the google provider has no token

```execute
aux4 google docs append 1AbCdEfGhIjKlMnOpQrStUvWxYz --text "Hello from aux4!" --tokenFile ./no-such-directory/google.json --apiUrl http://127.0.0.1:18992/api
```

```error:partial
no token found for provider "google"
```
