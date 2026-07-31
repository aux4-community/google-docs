# google docs update

Part of the `core` group in `test.suite.md`. Update PATCHes the existing file with a
`multipart/related` body (metadata part + media part) so Drive re-converts the source
and replaces the Doc's content while keeping the same ID. The Drive upload endpoint is
replaced by a local echo server via `--uploadApiUrl`.

## against a local mock API

```beforeAll
nohup node mock-echo.js 18996 >/dev/null 2>&1 &
for i in $(seq 1 40); do curl -s -o /dev/null http://127.0.0.1:18996/ 2>/dev/null && break; sleep 0.25; done
```

```afterAll
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

### should PATCH the existing file with a multipart/related body

```execute
aux4 google docs update DOC1 --file sample.md --uploadApiUrl http://127.0.0.1:18996 --tokenFile google-token.json
```

```expect:partial
"method": "PATCH"
```

```expect:partial
/files/DOC1?uploadType=multipart
```

```expect:partial
"contentType": "multipart/related
```

```expect:partial
# Sample Heading
```

### should rename the document when --title is given

```execute
aux4 google docs update DOC1 --file sample.md --title "New Name" --uploadApiUrl http://127.0.0.1:18996 --tokenFile google-token.json
```

```expect:partial
New Name
```

## missing source file

### should fail when --file is not provided

```execute
aux4 google docs update DOC1 --uploadApiUrl http://127.0.0.1:18996 --tokenFile google-token.json
```

```error:partial
--file is required
```

## without a stored token

### should report that the google provider has no token

```execute
aux4 google docs update DOC1 --file sample.md --uploadApiUrl http://127.0.0.1:18996 --tokenFile ./no-such-directory/google.json
```

```error:partial
no token found for provider "google"
```
