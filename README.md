# Japscan SemiAuto bulk download
This automation allows you to scrap a book from Japscan by first manually passing Cloudflare wall and Ads.


## Disclaimer
**/!\ This is not a Headless scraper, but more an automation for your google chrome.**
- Still a bit manual, no cloudflare skipping (because cloudflare is always changing)
- Do not abuse: Japscan will kill this project by simply changing the site if this is used too much
- Tested only once with one book

## Requirements
- NodeJS >=18
- Google Chrome (stable)

## Install
- `npm install`

## Manual startup
1. Setup google chrome shorcut (windows) or use cmd (linux)
    - [Windows] Shorcut target: "C:\Program Files\Google\Chrome\Application\chrome.exe --remote-debugging-port=9222
    - [other platform] check on google, its pretty straightforward.
2. Setup the Config file `config.yml` based on `example_config.yml`
    - you can just run the script, it will print you the example
3. Manually launch Google chrome, then:
    - Go to your Japscan chapter list page of the manga/webtoon you wanna dl.
        - **Keep only one tab open, not tested in other conditions**
        - example https://www.japscan.lol/manga/one-piece/
    - pass the cloudflare wall manually if needed
    - click once in the blank part of the page to trigger Ads, and then its ready !
4. Launch the script:
    - `node main.js`
    - keep the Google Chrome on always focused, or it will not download!

## Docs
More docs [here](docs/misc.md)
