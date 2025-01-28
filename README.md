# Japscan SemiAuto bulk download
This automation allows you to launch a Japscan scrapper but by first manually passing Cloudflare wall.

## Disclaimer
- This is still a bit manual, no cloudflare skipping (because cloudflare is always changing)
- Do not abuse: Japscan will kill this project by simply changing the site if this is used too much
- Tested only once with one book

## Requirements
- NodeJS >=18
- Google Chrome (stable)

## Manual startup
1. Setup google chrome shorcut (windows) or use cmd (linux)
    - [Windows] Shorcut target: "C:\Program Files\Google\Chrome\Application\chrome.exe --remote-debugging-port=9222
    - [other platform] check on google, its pretty straightforward.
2. Setup the Config file `config.yml` based on `example_config.yml`
    - you can just run the script, it will print you the example
3. Manually launch Google chrome, then:
    - Go to your Japscan chapter list page of the manga/webtoon you wanna dl.
        - example https://www.japscan.lol/manga/one-piece/
    - pass the cloudflare wall manually if needed
    - click once in the blank part of the page to trigger Ads, and then its ready !
4. Launch the script:
    - `npm install`
    - `node main.js`
    - keep the Google Chrome on always focused, or it will not download!


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