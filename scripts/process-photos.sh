#!/usr/bin/env bash
# Scale, watermark, and webp-encode photos for /static/photos.
# Downscales the long edge to MAX (never upscales), stamps a credit bar sized
# to the *scaled* width, and writes <name>.webp to the output dir.
#
# Usage: process-photos.sh <input-dir> [output-dir]
#          MAX=1440 QUALITY=88 process-photos.sh ...   # overridable
#   output-dir defaults to <input-dir>/processed
shopt -s nullglob nocaseglob

CREDIT="© Elija Sorensen  elijasorensen.com  @whiskeytuesday"
FONT="Adwaita-Sans"
MAX="${MAX:-1440}"          # max long-edge in px
QUALITY="${QUALITY:-88}"    # webp quality

usage() { echo "Usage: $0 <input-dir> [output-dir]"; exit 1; }
[[ $# -lt 1 ]] && usage

INPUT_DIR="$1"
OUTPUT_DIR="${2:-$INPUT_DIR/processed}"
[[ ! -d "$INPUT_DIR" ]] && echo "Error: $INPUT_DIR is not a directory" && exit 1
mkdir -p "$OUTPUT_DIR"

count=0
for img in "$INPUT_DIR"/*.{jpg,jpeg,png,webp,tif,tiff,heic}; do
    [[ -f "$img" ]] || continue
    name=$(basename "${img%.*}").webp

    # original dimensions
    read -r w h < <(magick identify -format "%w %h" "$img")

    # scaled dimensions: shrink the long edge to MAX, keep aspect, never upscale
    long=$(( w > h ? w : h ))
    if (( long > MAX )); then
        sw=$(( w * MAX / long ))
        sh=$(( h * MAX / long ))
    else
        sw=$w; sh=$h
    fi

    # credit bar sized off the scaled width (same heuristic as credit.sh)
    len=${#CREDIT}
    size=$(( sw * 17 / (len * 10) ))
    (( size < 14 )) && size=14
    pad=$(( size / 3 ))
    bar_h=$(( size + pad * 2 ))

    magick "$img" \
        -resize "${MAX}x${MAX}>" \
        \( -size "${sw}x${bar_h}" xc:"rgba(0,0,0,0.33)" \) \
        -gravity South -composite \
        -gravity South \
        -fill "rgba(255,255,255,0.8)" \
        -font "$FONT" \
        -pointsize "$size" \
        -annotate +0+${pad} "$CREDIT" \
        -quality "$QUALITY" \
        "$OUTPUT_DIR/$name"

    echo "$name  (${w}x${h} -> ${sw}x${sh})"
    ((count++))
done

echo "Done: $count images -> $OUTPUT_DIR"
