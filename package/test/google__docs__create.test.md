# google docs create

Part of the `core` group in `test.suite.md`. The Google Docs API is replaced by a
local echo server (`mock-echo.js`), so the test asserts the request aux4 builds —
method, path, `Authorization` header and JSON body — without touching a real
document.

## against a local mock API

```beforeAll
nohup node mock-echo.js 18990 >/dev/null 2>&1 &
sleep 2
```

```afterAll
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

### should POST to the documents endpoint with a bearer token

```execute
aux4 google docs create --title "Weekly Notes" --tokenFile google-token.json --apiUrl http://127.0.0.1:18990
```

```expect:partial
"authorization": "Bearer test-access-token"
```

```expect:partial
"contentType": "application/json"
```

```expect:partial
"method": "POST"
```

```expect:partial
"path": "/documents"
```

### should send the title in the request body

```execute
aux4 google docs create --title "Weekly Notes" --tokenFile google-token.json --apiUrl http://127.0.0.1:18990 | aux4 json get --path '$.body'
```

```expect:json
{
  "title": "Weekly Notes"
}
```

## without a stored token

### should report that the google provider has no token

```execute
aux4 google docs create --title "Weekly Notes" --tokenFile ./no-such-directory/google.json --apiUrl http://127.0.0.1:18990
```

```error:partial
no token found for provider "google"
```
