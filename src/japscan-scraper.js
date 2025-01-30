import fs from 'fs';
import { mkdir } from '#root/src/filesystem-handler.js';

/**
 * Check if the page is protected by Cloudflare, if so, stop the process
 * @param {Page} page
 */
async function breakWhenCFProtection(page) {
    const CFRayId = await page.$('.ray-id');
    if(CFRayId) {
        console.log('CF detected, stopping the process');
        process.exit(1);
    }
}

/**
 * Scrap the list of chapters from a Japscan Book chapters page located in https://www.japscan.lol/book/<manganame>/
 * @param {Page} page
 * @param {string} startAtTitle the title of the chapter to start the scraping from
 * @returns {Promise<Array>} array of chapterName and chapter numbers
 * @example
 * [
 *  { chapterName: 'Chapitre 1', chapterNumber: 1 },
 *  { chapterName: 'Chapitre 2', chapterNumber: 2 },
 *  { chapterName: 'Chapitre 3', chapterNumber: 3 },
 * ...
 * ]
 * 
 * chapterName is used to create the directory for the chapter
 * chapterNumber is used to navigate and scrape the chapter page images
 */
async function scrapeChaptersInfo(page, startAtTitle, endAtTitle) {
    await breakWhenCFProtection(page);

    const elements = await page.$$('.chapters_list > a');
    //for in this elements in reverse order
    let promises = elements.reverse().map(async (element, index) => {
        const text = await element.getProperty('innerText');
        let chapterName = (await text.jsonValue()).trim();
        return {
            //remove special chars, keep only one space between
            chapterName: chapterName.trim().replaceAll(/\W/g,' ').replace(/\s+/g, " "),
            //remove non-digit chars
            chapterNumber: chapterName.replaceAll(/\W|[a-z]/gi, '').trim(),
        };
    });
    
    const allChaptersInfo = await Promise.all(promises);
    let chaptersToDownload = allChaptersInfo;
    //if no startAtTitle is specified, return all chapters info
    if(startAtTitle === null) {
        chaptersToDownload = allChaptersInfo;
    }else{
        //filtering the chapters to start at the specified title
        let startAt = allChaptersInfo.findIndex((chapter) => chapter.chapterName === startAtTitle);
        if(startAt === -1) {
            console.error(`startAtChapter title given in config.yml not found: ${startAtTitle}`);
            process.exit(1);
        }
        chaptersToDownload = allChaptersInfo.slice(startAt);
    }

    //if no endAtTitle is specified, return all chapters info
    if(endAtTitle === null) {
        return chaptersToDownload;
    }else{
        //filtering the chapters to end at the specified title
        let endAt = chaptersToDownload.findIndex((chapter) => chapter.chapterName === endAtTitle);
        if(endAt === -1) {
            console.error(`endAtChapter title given in config.yml not found: ${endAtTitle}`);
            process.exit(1);
        }
        return chaptersToDownload.slice(0, endAt+1);
    }

}

/**
 * Download all images for one chapter
 * @param {Page} page the puppeteer page we scrape. It assumed we safely navigated to the chapter page first
 * @param {string} bookOutputPath the path to the book directory where we store the chapter images
 * @param {string} chapterName the name of the chapter, used as directory name
 * @param {boolean} isDryRun if true, do not save the images or create directories, but only logs the process
 */
async function scrapeChapterPages(page, bookOutputPath, chapterName, isDryRun) {
    //create directory for chapter if not exists
    let directoryChapterPath = `${bookOutputPath}/${chapterName}`;
    mkdir(directoryChapterPath, isDryRun);

    // get all divs with id starting with 'd-img-'
    const divs = await page.$$('div[id^="d-img-"]');

    for (let i = 0; i < divs.length; i++) {
        const div = divs[i];
        await scrapePngFromDiv(i+1, div, directoryChapterPath, isDryRun); //i+1 to have a page named page-1 and not starting at 0
    }
}

/**
 * Save a png screenshot of a div
 * @param {number} index the index of the page
 * @param {ElementHandle} div the div element to screenshot
 * @param {string} chapterPath the path to the chapter directory where we store the page images
 * @param {boolean} isDryRun if true, do not save the images, but only logs the process
 */
async function scrapePngFromDiv(index, div, chapterPath, isDryRun, isDebug) {
    const screen = await div.screenshot();
    let pagePath = `${chapterPath}/page-${index}.png`
    if(isDryRun) {
        console.log(`dry run: skipping page save: ${pagePath}`);
    } else {
        fs.writeFileSync(pagePath, screen);
        if(isDebug) console.log(`page saved: ${pagePath}`);
    }
}

/**
 * Navigate to a chapter page and wait for the page to load
 * @param {Page} page the puppeteer page we navigate
 * @param {string} urlToChapter the url to the chapter page
 * @param {number} timeout the timeout in ms to wait for the page to load
 */
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

export { scrapeChaptersInfo, scrapeChapterPages, navigateToChapter };