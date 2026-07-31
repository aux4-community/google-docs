# google docs batch-update

Part of the `core` group in `test.suite.md`. The Google Docs API is replaced by a
local echo server (`mock-echo.js`), so the test asserts that the raw `--requests`
array is wrapped as `{"requests": [...]}` and POSTed to the `:batchUpdate` endpoint,
without touching a real document.

## against a local mock API

```beforeAll
nohup node mock-echo.js 18993 >/dev/null 2>&1 &
sleep 2
```

```afterAll
pkill -f "18993" 2>/dev/null
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

### should POST to the batchUpdate endpoint with a bearer token

```execute
aux4 google docs batch-update 1AbCdEfGhIjKlMnOpQrStUvWxYz --requests '[{"insertText":{"location":{"index":1},"text":"Title\n"}}]' --tokenFile google-token.json --apiUrl http://127.0.0.1:18993
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
"path": "/documents/1AbCdEfGhIjKlMnOpQrStUvWxYz:batchUpdate"
```

### should wrap the raw requests array under a requests key

```execute
aux4 google docs batch-update 1AbCdEfGhIjKlMnOpQrStUvWxYz --requests '[{"insertText":{"location":{"index":1},"text":"Title paragraph"}}]' --tokenFile google-token.json --apiUrl http://127.0.0.1:18993 | aux4 json get --path '$.body'
```

```expect:json
{
  "requests": [
    {
      "insertText": {
        "location": {
          "index": 1
        },
        "text": "Title paragraph"
      }
    }
  ]
}
```

### should pass through multiple requests in order

```execute
aux4 google docs batch-update 1AbCdEfGhIjKlMnOpQrStUvWxYz --requests '[{"insertText":{"location":{"index":1},"text":"Overview"}},{"updateTextStyle":{"range":{"startIndex":1,"endIndex":9},"textStyle":{"bold":true},"fields":"bold"}}]' --tokenFile google-token.json --apiUrl http://127.0.0.1:18993 | aux4 json get --path '$.body'
```

```expect:json
{
  "requests": [
    {
      "insertText": {
        "location": {
          "index": 1
        },
        "text": "Overview"
      }
    },
    {
      "updateTextStyle": {
        "fields": "bold",
        "range": {
          "endIndex": 9,
          "startIndex": 1
        },
        "textStyle": {
          "bold": true
        }
      }
    }
  ]
}
```

## without a stored token

### should report that the google provider has no token

```execute
aux4 google docs batch-update 1AbCdEfGhIjKlMnOpQrStUvWxYz --requests '[{"insertText":{"location":{"index":1},"text":"Title\n"}}]' --tokenFile ./no-such-directory/google.json --apiUrl http://127.0.0.1:18993
```

```error:partial
no token found for provider "google"
```
