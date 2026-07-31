# google docs command injection

Part of the `core` group in `test.suite.md`. Regression test for the confirmed
command-injection vector in `google docs import`: the `--title` flag flows into a
`jq` metadata builder that previously interpolated the raw value into a shell
command (`DOC_TITLE='${docTitle}' jq ...`). The value is now passed through
`value()`, which shell-escapes it, so a title crafted to break out of the quotes
is treated as literal text instead of being executed.

## title flag cannot inject shell commands

```beforeAll
rm -f /tmp/AUX4_INJ_docs
```

```afterAll
rm -f /tmp/AUX4_INJ_docs
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

```file:inject-source.md
# Hello
```

### should treat an injected --title as literal text, not a shell command

```execute
aux4 google docs import inject-source.md --title "x'; touch /tmp/AUX4_INJ_docs; echo '" --uploadApiUrl http://127.0.0.1:1 --tokenFile google-token.json </dev/null
```

```error:partial
Error: Post "http://127.0.0.1:1/files?uploadType=multipart
```

### should not have executed the injected command

```execute
test -f /tmp/AUX4_INJ_docs && echo VULNERABLE || echo SAFE
```

```expect
SAFE
```
