# google docs get

Part of the `core` group in `test.suite.md`. The Google Docs API is replaced by a
local echo server (`mock-echo.js`) so the GET request can be asserted without a real
document.

## against a local mock API

```beforeAll
nohup node mock-echo.js 18991 >/dev/null 2>&1 &
sleep 2
```

```afterAll
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

### should GET the document resource with a bearer token

```execute
aux4 google docs get 1AbCdEfGhIjKlMnOpQrStUvWxYz --tokenFile google-token.json --apiUrl http://127.0.0.1:18991
```

```expect:partial
"method": "GET"
```

```expect:partial
"path": "/documents/1AbCdEfGhIjKlMnOpQrStUvWxYz"
```

```expect:partial
"authorization": "Bearer test-access-token"
```

### should send no request body

```execute
aux4 google docs get 1AbCdEfGhIjKlMnOpQrStUvWxYz --tokenFile google-token.json --apiUrl http://127.0.0.1:18991 | aux4 json get --path '$.body'
```

```expect
null
```

## without a stored token

### should report that the google provider has no token

```execute
aux4 google docs get 1AbCdEfGhIjKlMnOpQrStUvWxYz --tokenFile ./no-such-directory/google.json --apiUrl http://127.0.0.1:18991
```

```error:partial
no token found for provider "google"
```
