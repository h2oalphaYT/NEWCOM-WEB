#!/usr/bin/env bash
# Installs Node.js 22 under /opt/node22 for the Newcom frontend only.
# The system Node.js (/usr/bin/node) and every other app on the server are left untouched.
# Safe to run again: it does nothing when /opt/node22 already has Node 22.
set -euo pipefail

VERSION="${NODE_VERSION:-v22.11.0}"
DEST=/opt/node22
ARCH=$(uname -m)
case "$ARCH" in
  x86_64) PLATFORM=linux-x64 ;;
  aarch64) PLATFORM=linux-arm64 ;;
  *) echo "unsupported CPU: $ARCH" >&2; exit 1 ;;
esac

if [ -x "$DEST/bin/node" ] && "$DEST/bin/node" -v | grep -q '^v22\.'; then
  echo "Node $("$DEST/bin/node" -v) already installed in $DEST"
  exit 0
fi

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
FILE="node-$VERSION-$PLATFORM.tar.xz"
cd "$TMP"
curl -fsSLO "https://nodejs.org/dist/$VERSION/$FILE"
curl -fsSLO "https://nodejs.org/dist/$VERSION/SHASUMS256.txt"
grep " $FILE\$" SHASUMS256.txt | sha256sum -c -

sudo mkdir -p "$DEST"
sudo tar -xJf "$FILE" -C "$DEST" --strip-components=1
echo "Installed Node $("$DEST/bin/node" -v), npm $("$DEST/bin/npm" -v) in $DEST"
