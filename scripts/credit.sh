#!/usr/bin/env bash
shopt -s nullglob nocaseglob

CREDIT="© Elija Sorensen  elijasorensen.com  @whiskeytuesday"

usage() {
    echo "Usage: $0 <input-dir> [output-dir]"
    echo "  If output-dir is omitted, writes to <input-dir>/credited/"
    exit 1
}

[[ $# -lt 1 ]] && usage

INPUT_DIR="$1"
OUTPUT_DIR="${2:-$INPUT_DIR/credited}"

[[ ! -d "$INPUT_DIR" ]] && echo "Error: $INPUT_DIR is not a directory" && exit 1

mkdir -p "$OUTPUT_DIR"

count=0
for img in "$INPUT_DIR"/*.{jpg,jpeg,png,webp}; do
    [[ -f "$img" ]] || continue
    name=$(basename "$img")

    dims=$(magick identify -format "%w %h" "$img")
    w=${dims% *}
    h=${dims#* }

    # Size text to span roughly the full width — trial: ~w/20 chars, so pointsize ≈ w / (len/1.7)
    len=${#CREDIT}
    size=$(( w * 17 / (len * 10) ))
    (( size < 14 )) && size=14

    pad=$(( size / 3 ))
    bar_h=$(( size + pad * 2 ))

    magick "$img" \
        \( -size "${w}x${bar_h}" xc:"rgba(0,0,0,0.33)" \) \
        -gravity South -composite \
        -gravity South \
        -fill "rgba(255,255,255,0.8)" \
        -font "Adwaita-Sans" \
        -pointsize "$size" \
        -annotate +0+${pad} "$CREDIT" \
        "$OUTPUT_DIR/$name"

    echo "$name"
    ((count++))
done

echo "Done: $count images -> $OUTPUT_DIR"
