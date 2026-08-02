# google docs batch-update

Part of the `core` group in `test.suite.md`. The Google Docs API is replaced by an
`aux4/mock` server, so the command runs against a realistic `batchUpdate` reply while
the outgoing request is asserted with `aux4 mock verify` — proving the raw `--requests`
array is wrapped as `{"requests": [...]}` and POSTed to the `:batchUpdate` endpoint,
without touching a real document.

## against a local mock API

```beforeAll
aux4 aux4 pkger install aux4/mock
```

```afterAll
aux4 mock stop --port 18993 2>/dev/null
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

### should return the batchUpdate reply

```execute
aux4 mock start --port 18993 >/dev/null 2>&1
sleep 1
aux4 mock stub --port 18993 --method POST --path /documents/{id}:batchUpdate --status 200 --body '{"documentId":"${path.id}","replies":[{}],"writeControl":{"requiredRevisionId":"ALm37e"}}' >/dev/null 2>&1
aux4 google docs batch-update 1AbCdEfGhIjKlMnOpQrStUvWxYz --requests '[{"insertText":{"location":{"index":1},"text":"Title\n"}}]' --tokenFile google-token.json --apiUrl http://127.0.0.1:18993/api
```

```expect:partial
"documentId":"1AbCdEfGhIjKlMnOpQrStUvWxYz"
```

### should POST to the batchUpdate endpoint with a bearer token

```execute
aux4 mock verify --port 18993 --method POST --path /documents/1AbCdEfGhIjKlMnOpQrStUvWxYz:batchUpdate --header "authorization=Bearer test-access-token" --header "content-type=application/json"
```

```expect:partial
verify ok
```

### should wrap the raw requests array under a requests key

The recorded request body is stored raw (a string), so it is asserted with
`mock verify --body-contains` rather than navigated by JSON path.

```execute
aux4 mock reset --port 18993 --requests >/dev/null 2>&1
aux4 google docs batch-update 1AbCdEfGhIjKlMnOpQrStUvWxYz --requests '[{"insertText":{"location":{"index":1},"text":"Title paragraph"}}]' --tokenFile google-token.json --apiUrl http://127.0.0.1:18993/api >/dev/null 2>&1
aux4 mock verify --port 18993 --method POST --path /documents/1AbCdEfGhIjKlMnOpQrStUvWxYz:batchUpdate --body-contains '{"requests":[{"insertText":{"location":{"index":1},"text":"Title paragraph"}}]}'
```

```expect:partial
verify ok
```

### should pass through multiple requests in order

```execute
aux4 mock reset --port 18993 --requests >/dev/null 2>&1
aux4 google docs batch-update 1AbCdEfGhIjKlMnOpQrStUvWxYz --requests '[{"insertText":{"location":{"index":1},"text":"Overview"}},{"updateTextStyle":{"range":{"startIndex":1,"endIndex":9},"textStyle":{"bold":true},"fields":"bold"}}]' --tokenFile google-token.json --apiUrl http://127.0.0.1:18993/api >/dev/null 2>&1
aux4 mock verify --port 18993 --method POST --path /documents/1AbCdEfGhIjKlMnOpQrStUvWxYz:batchUpdate --body-contains '{"requests":[{"insertText":{"location":{"index":1},"text":"Overview"}},{"updateTextStyle":'
```

```expect:partial
verify ok
```

## without a stored token

### should report that the google provider has no token

```execute
aux4 google docs batch-update 1AbCdEfGhIjKlMnOpQrStUvWxYz --requests '[{"insertText":{"location":{"index":1},"text":"Title\n"}}]' --tokenFile ./no-such-directory/google.json --apiUrl http://127.0.0.1:18993/api
```

```error:partial
no token found for provider "google"
```
