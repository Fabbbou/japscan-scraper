## Converting to cbz

> CLI requirements:
> - zip

I'm using tachiyomi, so it's better to use CBZ files structure to avoid messing inside my android phone gallery with pictures
The `cbz.sh` script converts directly a complete folder to a complete other.
```sh
./cbz.sh scriptOutputDir/bookName outputCbzDir/yourBook
```


## [Optional] Croping images
> CLI requirements:
> - ffmpeg
Sometimes the images are cropped, here is an example of a cropping script

This ffmpeg cmd should do the trick for an entire folder
You might need to change START_AT to match your needs

This script crop the 8 pixels on the left side of the images 
```sh
#!/bin/bash
START_AT="15"
# Create the backup directory if it doesn't exist
mkdir -p non_cropped

# Process files starting from "Chapitre 15"
ll -v scriptOutputDir/bookName/Chapitre*/page-1.png | \
sed -n "/Chapitre $START_AT/,$ s/^.*screenshots/screenshots/p" | while read -r INPUT; do
    # Backup the original file
    cp "$INPUT" "non_cropped/$(basename "$INPUT")"

    # Crop the image and overwrite the original
    ffmpeg -y -i "$INPUT" -vf "crop=iw-8:ih:8:0" "$INPUT"
done
```