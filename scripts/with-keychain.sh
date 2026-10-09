#!/bin/bash
# Runs a command with the app's secrets loaded from the macOS login Keychain
# (standards/04 rule 15a: environment first, then Keychain; never .env files).
# Store a secret once with:
#   security add-generic-password -s GOOGLE_CLIENT_ID -a "$USER" -w '<value>'
# Usage: scripts/with-keychain.sh bun run dev
set -euo pipefail

for name in BETTER_AUTH_SECRET BETTER_AUTH_URL GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET DATABASE_URL; do
  if [ -z "${!name:-}" ]; then
    if value=$(security find-generic-password -s "$name" -a "$USER" -w 2>/dev/null); then
      export "$name=$value"
    fi
  fi
done

exec "$@"
