#!/bin/bash

# 1. Setup
mkdir -p processed_images
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# 2. Define the list (Name|URL)
# I have consolidated all your requests here.
images=(
    "Chichen Itza|https://commons.wikimedia.org/wiki/Special:FilePath/Chichen_Itza_3.jpg"
    "Black Hole|https://commons.wikimedia.org/wiki/Special:FilePath/A_view_of_the_Milky_Way_supermassive_black_hole_Sagittarius_A*_in_polarised_light_(eso2406a).jpg"
    "Niagara Falls|https://commons.wikimedia.org/wiki/Special:FilePath/Niagara_Falls_before_sunrise.jpg"
    "Ant Portrait|https://commons.wikimedia.org/wiki/Special:FilePath/Portrait_of_an_ant,_profile_view.jpg"
    "Daphnia|https://commons.wikimedia.org/wiki/Special:FilePath/Daphnia.sp.jpg"
    "Earthrise Apollo 15|https://commons.wikimedia.org/wiki/Special:FilePath/Apollo_15_Earthrise.jpg"
    "Earthrise Cutout|https://commons.wikimedia.org/wiki/Special:FilePath/Earthrise_cutout.jpg"
    "Blue Marble Remastered|https://commons.wikimedia.org/wiki/Special:FilePath/The_Blue_Marble_(remastered).jpg"
    "Apollo 17 Earth|https://commons.wikimedia.org/wiki/Special:FilePath/The_Earth_seen_from_Apollo_17_(Original_Orientation).jpg"
    "Hubble Ultra Deep Field High|https://commons.wikimedia.org/wiki/Special:FilePath/Hubble_ultra_deep_field_high_rez.jpg"
    "HUDF MUSE|https://commons.wikimedia.org/wiki/Special:FilePath/The_Hubble_Ultra_Deep_Field_seen_with_MUSE.jpg"
    "Pillars of Creation|https://commons.wikimedia.org/wiki/Special:FilePath/Pillars_of_Creation_(NIRCam_Image).jpg"
    "JWST Spacecraft|https://commons.wikimedia.org/wiki/Special:FilePath/JWST_spacecraft_model_3.png"
    "Great Wave|https://commons.wikimedia.org/wiki/Special:FilePath/The_Great_Wave_off_Kanagawa.jpg"
    "Mona Lisa|https://commons.wikimedia.org/wiki/Special:FilePath/Mona_Lisa.jpg"
    "Vancouver Skyline|https://commons.wikimedia.org/wiki/Special:FilePath/Downtown_Vancouver_skyline_(Grouse_Mountain_on_upper_right)_(2289627186).jpg"
    "Earthrise Apollo 11|https://commons.wikimedia.org/wiki/Special:FilePath/Earth_Rise_as_Seen_From_Lunar_Surface.jpg"
    "CNN|https://commons.wikimedia.org/wiki/Special:FilePath/CNN.svg"
    "ABC News|https://commons.wikimedia.org/wiki/Special:FilePath/ABC%20News%20logo%202021.svg"
    "CBS News|https://commons.wikimedia.org/wiki/Special:FilePath/CBS%20News%20logo%20(2020).svg"
    "NBC News|https://commons.wikimedia.org/wiki/Special:FilePath/NBC%20News%20(2023).svg"
    "MSNBC|https://commons.wikimedia.org/wiki/Special:FilePath/MSNBC%202023.svg"
    "PBS|https://commons.wikimedia.org/wiki/Special:FilePath/PBS%20logo%202019.svg"
    "NPR|https://commons.wikimedia.org/wiki/Special:FilePath/NPR%20new%20logo.svg"
    "Fox News Channel|https://commons.wikimedia.org/wiki/Special:FilePath/Fox%20News%20Channel%20logo.svg"
    "Associated Press|https://commons.wikimedia.org/wiki/Special:FilePath/Associated%20Press%20logo%202012.svg"
    "Reuters|https://commons.wikimedia.org/wiki/Special:FilePath/Reuters%20logo%202024.svg"
    "BBC News|https://commons.wikimedia.org/wiki/Special:FilePath/BBC%20News%202022%20(Alt).svg"
    "Bloomberg|https://commons.wikimedia.org/wiki/Special:FilePath/Bloomberg%20logo.svg"
    "The Guardian|https://commons.wikimedia.org/wiki/Special:FilePath/The%20Guardian%202018.svg"
    "Financial Times|https://commons.wikimedia.org/wiki/Special:FilePath/Financial%20Times%20corporate%20logo.svg"
    "Deutsche Welle|https://commons.wikimedia.org/wiki/Special:FilePath/Deutsche%20Welle%20Logo.svg"
    "France 24|https://commons.wikimedia.org/wiki/Special:FilePath/France%2024%20logo%20(2013).svg"
    "CBC News|https://commons.wikimedia.org/wiki/Special:FilePath/CBC%20News%20Logo.svg"
    "AFP|https://commons.wikimedia.org/wiki/Special:FilePath/Agence%20France-Presse%20Logo.svg"
    "AJ Plus|https://commons.wikimedia.org/wiki/Special:FilePath/Logo%20AJ%2B.svg"
    "CNBC|https://commons.wikimedia.org/wiki/Special:FilePath/CNBC%20logo.svg"
)

# 3. Processing Loop
while IFS="|" read -r name url; do
    [ -z "$name" ] && continue

    safe_name=$(echo "$name" | tr '[:upper:]' '[:lower:]' | tr -cd '[:alnum:]_-')
    temp_file="temp_${safe_name}"
    final_file="processed_images/${safe_name}.jpg"

    echo "Processing: $name..."

    # Download
    curl -H "User-Agent: $UA" -L -s -o "$temp_file" "$url"

    # Detect Filetype
    file_type=$(file --mime-type -b "$temp_file")

    if [[ "$file_type" == *"html"* ]]; then
        echo "  [SKIP] Error: Downloaded HTML. URL might be incorrect."
        rm "$temp_file"
        continue
    fi

    # Conversion
    if [[ "$file_type" == *"svg"* ]]; then
        # -density 300 ensures the SVG renders sharply before being resized to 400px
        magick -density 300 "$temp_file" -background white -flatten -resize 400x400 -quality 80 "$final_file"
    else
        magick "$temp_file" -background white -flatten -resize 400x400 -quality 80 "$final_file"
    fi

    rm "$temp_file"
done <<< "$image_list"

echo "Batch processing complete."