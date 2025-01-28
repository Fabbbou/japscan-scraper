import puppeteer from 'puppeteer-core';
import fs from 'fs';
import yaml from 'js-yaml';

//----------------------------------------------
// Config checking
//----------------------------------------------

//stop process if config file is not found
if (!fs.existsSync('config.yml')) {
    console.error('config.yml not found');
    console.error('please create a config.yml file following example_config.yml structure');
    process.exit(1);
}

//read a config yaml file
const config = yaml.load(fs.readFileSync('config.yml'));

//----------------------------------------------
// Functions
//----------------------------------------------

async function getWebSocketDebuggerUrl(port) {
    const response = await fetch(`http://127.0.0.1:${port}/json/version`);
    const data = await response.json();
    return data.webSocketDebuggerUrl;
}

function createWebtoonFolder(screenshotFolder, webtoonName, dryRun) {
    const webtoonPath = `${screenshotFolder}/${webtoonName}`;
    //create folder for webtoon if not exists
    mkdirDryRun(webtoonPath, dryRun);
    return webtoonPath;
}

/**
 * Scrap the list of chapters from a Japscan Manga/Webtoon list page located in https://www.japscan.lol/manga/<manganame>/
 * @param {Page} page
 * @returns {Promise<Array>} array of objects with chapterName and element
 * @example
 * [
 *  { chapterName: 'Chapitre 1', chapterNumber: 1 },
 *  { chapterName: 'Chapitre 2', chapterNumber: 2 },
 *  { chapterName: 'Chapitre 3', chapterNumber: 3 },
 * ...
 * ]
 * 
 * chapterName is used to create the folder for the chapter
 * chapterNumber is used to navigate and scrape the chapter page
 */
async function scrapeChaptersInfo(page) {
    await breakWhenCFProtection(page);

    const elements = await page.$$('.chapters_list > a');
    //for in this elements in reverse order
    let promises = elements.reverse().map(async (element, index) => {
        const text = await element.getProperty('innerText');
        let chapterName = (await text.jsonValue()).trim();
        return {
            chapterName,
            chapterNumber: chapterName.replaceAll('Chapitre', '').trim(),
        };
    });
    return Promise.all(promises);
}

/**
 * Download all images of an chapter of a webtoon
 * @param {Page} page
 * @param {string} outputPath
 * @param {number} chapterName
 * @param {boolean} dryRun stop the process before downloading any screenshot
 */
async function scrapeChapter(page, outputPath, chapterName, dryRun) {
    //create folder for chapter if not exists
    let folderChapterPath = `${outputPath}/${chapterName}`;
    mkdirDryRun(folderChapterPath, dryRun);

    // get all divs with id starting with 'd-img-'
    const divs = await page.$$('div[id^="d-img-"]');

    for (let i = 0; i < divs.length; i++) {
        const div = divs[i];
        await scrapePngFromDiv(i+1, div, folderChapterPath, dryRun); //i+1 to have a page named page-1 and not starting at 0
    }
}

function mkdirDryRun(dirPath, dryRun) {
    if (!fs.existsSync(dirPath)) {
        if (dryRun) {
            console.log(`dry run: skipping creating dir ${dirPath}`);
        } else {
            fs.mkdirSync(dirPath);
            console.log(`creating dir ${dirPath}`);
        }
    }
}

async function scrapePngFromDiv(index, div, chapterPath, dryRun) {
    const screen = await div.screenshot();
    let pagePath = `${chapterPath}/page-${index}.png`
    if(dryRun) {
        console.log(`dry run: skipping page save: ${pagePath}`);
    } else {
        fs.writeFileSync(pagePath, screen);
        console.log(`page saved: ${pagePath}`);
    }
}

async function breakWhenCFProtection(page) {
    const CFRayId = await page.$('.ray-id');
    if(CFRayId) {
        console.log('CF detected, stopping the process');
        process.exit(1);
    }
}

async function navigateToChapter(page, urlToChapter, timeout) {
    //go to chapter page
    page.goto(urlToChapter, {timeout: timeout});
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: timeout});
    
    await breakWhenCFProtection(page);

    //remove annoying dropdown that mess with screenshots
    await page.evaluate(() => {
        var elements = document.querySelectorAll('.sticky-top');
        elements.forEach(element => element.remove());
    });

    
}

//----------------------------------------------
// Start Process
//----------------------------------------------

/**
 * The google chrome page has to be already open, single tab, and has to be the list page of the webtoon/maga you wanna download
 * Example url : https://www.japscan.lol/manga/one-piece/
 */
async function main(config) {
    const webtoonFolder = createWebtoonFolder(config.outputPath, config.bookName, config.dryRun);
    const websocketUrlChromeDebug = await getWebSocketDebuggerUrl(config.chromeDebugPort);
    let browser = await puppeteer.connect({
        browserWSEndpoint: websocketUrlChromeDebug,
        defaultViewport: null,
    });

    console.log('connected to browser');
    console.log('Keep the Google Chrome always on focus, or it will process');
    const pages = await browser.pages();
    const page = pages[0];

    const chapters = await scrapeChaptersInfo(page);
    try{
        for (let i = config.startAtChapterNumber; i < chapters.length; i++) {
            let chapterObj = chapters[i];
            let urlToChapter = config.patternChapterUrl.replace('<chapterNumber>', chapterObj.chapterNumber);
            await navigateToChapter(page, urlToChapter, config.navigationTimeout);
            await scrapeChapter(page, webtoonFolder, chapterObj.chapterName, config.dryRun);
            console.log(`chapter index${i} downloaded - ${urlToChapter}`);
        }
    }catch(e){
        console.error(`error downloading chapter ${i}`);
        console.error(e);
    }

    browser.disconnect();
}

main(config);
