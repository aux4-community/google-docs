# google docs import

Part of the `core` group in `test.suite.md`. Import uploads a source file to the
Drive upload endpoint as `multipart/related` (a JSON metadata part + the media
part) so Drive converts it into a Doc. The upload endpoint is replaced by a local
echo server via `--uploadApiUrl`, and the test asserts the request `docs import`
builds — method, path, `multipart/related` content type, the Doc metadata and the
file's contents.

## against a local mock API

```beforeAll
nohup node mock-echo.js 18995 >/dev/null 2>&1 &
for i in $(seq 1 40); do curl -s -o /dev/null http://127.0.0.1:18995/ 2>/dev/null && break; sleep 0.25; done
```

```afterAll
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

### should upload the file as multipart/related with Doc metadata

```execute
aux4 google docs import sample.md --title "My Imported Doc" --uploadApiUrl http://127.0.0.1:18995 --tokenFile google-token.json
```

```expect:partial
"method": "POST"
```

```expect:partial
/files?uploadType=multipart
```

```expect:partial
"contentType": "multipart/related
```

```expect:partial
application/vnd.google-apps.document
```

```expect:partial
My Imported Doc
```

```expect:partial
Content-Type: text/markdown
```

```expect:partial
# Sample Heading
```

### should default the title to the file name without extension

```execute
aux4 google docs import sample.md --uploadApiUrl http://127.0.0.1:18995 --tokenFile google-token.json
```

```expect:partial
\"name\":\"sample\"
```

## without a stored token

### should report that the google provider has no token

```execute
aux4 google docs import sample.md --uploadApiUrl http://127.0.0.1:18995 --tokenFile ./no-such-directory/google.json
```

```error:partial
no token found for provider "google"
```
