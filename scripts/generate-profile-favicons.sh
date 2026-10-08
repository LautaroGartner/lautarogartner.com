#!/bin/sh
set -eu
# Run from repository root. Derived from the original About photo, without editing it.
icon_tmp=$(mktemp -d)
trap 'rm -rf "$icon_tmp"' EXIT
magick public/portrait/lautaro-1122.webp -crop 1000x1000+61+130 +repage -strip -resize 512x512 "$icon_tmp/master.png"
magick "$icon_tmp/master.png" -define icon:auto-resize=48,32,16 public/favicon.ico
magick "$icon_tmp/master.png" -resize 32x32 public/favicon-32.png
magick "$icon_tmp/master.png" -resize 180x180 -colors 256 PNG8:public/apple-touch-icon.png
magick "$icon_tmp/master.png" -resize 192x192 -colors 256 PNG8:public/icon-192.png
magick "$icon_tmp/master.png" -colors 256 PNG8:public/icon-512.png
magick "$icon_tmp/master.png" -resize 96x96 -colors 256 "PNG8:$icon_tmp/svg-photo.png"
python3 - "$icon_tmp/svg-photo.png" <<'PY'
import base64,sys
from pathlib import Path
png=base64.b64encode(Path(sys.argv[1]).read_bytes()).decode()
Path('public/favicon.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><image width="96" height="96" href="data:image/png;base64,{png}"/></svg>\n')
PY
