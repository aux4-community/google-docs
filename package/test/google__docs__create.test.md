# google docs create

Part of the `core` group in `test.suite.md`. The Google Docs API is replaced by an
`aux4/mock` server, so the command runs against a realistic document resource while
the outgoing `POST /documents` request — method, path, `Authorization` header,
`Content-Type` and JSON body — is asserted with `aux4 mock verify`, without touching
a real document.

## against a local mock API

```beforeAll
aux4 aux4 pkger install aux4/mock
```

```afterAll
aux4 mock stop --port 18990 2>/dev/null
pkill -f "18990" 2>/dev/null
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

### should return the created document resource

```execute
aux4 mock start --port 18990 >/dev/null 2>&1
sleep 1
aux4 mock stub --port 18990 --method POST --path /documents --status 200 --body '{"documentId":"1AbCdEfGhIjKlMnOpQrStUvWxYz","title":"Weekly Notes","body":{"content":[{"sectionBreak":{}}]},"revisionId":"ALm37B","documentStyle":{}}' >/dev/null 2>&1
aux4 google docs create --title "Weekly Notes" --tokenFile google-token.json --apiUrl http://127.0.0.1:18990/api
```

```expect:partial
"title":"Weekly Notes"
```

### should POST to the documents endpoint with a bearer token

```execute
aux4 mock verify --port 18990 --method POST --path /documents --header "authorization=Bearer test-access-token" --header "content-type=application/json"
```

```expect:partial
verify ok
```

### should send the title in the request body

```execute
aux4 mock verify --port 18990 --method POST --path /documents --body-contains '"title":"Weekly Notes"'
```

```expect:partial
verify ok
```

## without a stored token

### should report that the google provider has no token

```execute
aux4 google docs create --title "Weekly Notes" --tokenFile ./no-such-directory/google.json --apiUrl http://127.0.0.1:18990/api
```

```error:partial
no token found for provider "google"
```
