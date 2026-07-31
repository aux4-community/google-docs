# google-docs test suite

Run the CI-safe group with `aux4 test run --group core` from this directory. The
`integration` group needs a real Google login and is skipped unless requested.

## core

- google__docs__create.test.md
- google__docs__get.test.md
- google__docs__append.test.md
- google__docs__batch-update.test.md
- google__docs__export.test.md
- google__docs__import.test.md
- google__docs__update.test.md
- google_docs__injection.test.md

## integration (optional)

- google__docs.test.md
