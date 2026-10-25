#!/usr/bin/env bash
# Installs Node.js 22 into its own folder (default /opt/node22) for the NEWCOM frontend only.
# System Node.js (/usr/bin/node) and every other app on the server are left untouched.
# Re-runnable: does nothing if the folder already has Node 22, and never overwrites a folder that
# holds something else. The archive is checked against the official SHASUMS256.txt first.
#
#   bash install-node22.sh                         # -> /opt/node22
#   NODE_DIR=/opt/node-v22 bash install-node22.sh  # another folder
set -euo pipefail

VERSION="${NODE_VERSION:-v22.11.0}"
DEST="${NODE_DIR:-/opt/node22}"
case "$(uname -m)" in
  x86_64) PLATFORM=linux-x64 ;;
  aarch64) PLATFORM=linux-arm64 ;;
  *) echo "unsupported CPU: $(uname -m)" >&2; exit 1 ;;
esac

echo "Node.js installs already on this server:"
for d in /usr/bin /usr/local/bin /opt/*/bin; do
  if [ -x "$d/node" ]; then echo "  $d/node $("$d/node" -v 2>/dev/null || echo '?')"; fi
done

if [ -x "$DEST/bin/node" ]; then
  have=$("$DEST/bin/node" -v)
  case "$have" in
    v22.*) echo "Node $have is already installed in $DEST; nothing to do."; exit 0 ;;
    *) echo "$DEST already holds Node $have; not touching it. Pick another NODE_DIR." >&2; exit 1 ;;
  esac
fi
if [ -d "$DEST" ] && [ -n "$(ls -A "$DEST" 2>/dev/null)" ]; then
  echo "$DEST exists and is not empty (no bin/node inside); not touching it. Pick another NODE_DIR." >&2
  exit 1
fi

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
FILE="node-$VERSION-$PLATFORM.tar.xz"
cd "$TMP"
curl -fsSLO "https://nodejs.org/dist/$VERSION/$FILE"
curl -fsSLO "https://nodejs.org/dist/$VERSION/SHASUMS256.txt"
grep " $FILE\$" SHASUMS256.txt > expected.sha256
[ -s expected.sha256 ] || { echo "no checksum for $FILE in SHASUMS256.txt" >&2; exit 1; }
sha256sum -c expected.sha256

mkdir unpacked
tar -xJf "$FILE" -C unpacked --strip-components=1
unpacked/bin/node -v >/dev/null
sudo mkdir -p "$DEST"
sudo cp -a unpacked/. "$DEST/"
echo "Installed Node $("$DEST/bin/node" -v), npm $("$DEST/bin/npm" -v) in $DEST"
echo "System Node is unchanged: $(/usr/bin/node -v 2>/dev/null || echo 'none')"
