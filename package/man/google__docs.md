#### Description

The `google docs` command group provides access to Google Docs through the Google Docs API v1. Every request is signed with the shared Google OAuth2 token that `community/google-auth` maintains, so there is nothing to configure beyond a single login.

Available subcommands:

- **create** — Create a new empty document with a title
- **get** — Read a document's full structured content by ID
- **append** — Append text to the end of a document
- **batch-update** — Apply a raw array of Google Docs `batchUpdate` requests

#### Prerequisites

Authenticate once before first use. Scopes are resolved from the installed Google service packages, so no `--scopes` flag is required:

```bash
aux4 google auth login
```

This package requests `https://www.googleapis.com/auth/documents`, which allows creating, reading, and editing documents. For read-only usage, `aux4 google auth login --readonly true` requests `https://www.googleapis.com/auth/documents.readonly`, which is enough for the `get` command.

The token is read from `~/.aux4.config/.oauth/google.json`. Override it per command with `--tokenFile`, or for the whole shell with the `AUX4_GOOGLE_TOKEN_FILE` environment variable.

#### Usage

```bash
aux4 google docs <subcommand>
```

#### Example

```bash
aux4 google docs create --title "My Report"
aux4 google docs get 1AbCdEfGhIjKlMnOpQrStUvWxYz
aux4 google docs append 1AbCdEfGhIjKlMnOpQrStUvWxYz --text "Hello from aux4!"
```
