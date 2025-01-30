import config from '#root/src/config-loader.js';
import { getPuppeteerWrapper } from '#root/src/puppeteer-wrapper.js';
import { navigateToChapter, scrapeChapterPages, scrapeChaptersInfo } from '#root/src/japscan-scraper.js';

/**
 * The google chrome page has to be already open with single tab pointing to the book chapter list of the book you wanna download
 * Example url : https://www.japscan.lol/manga/one-piece/
 */
async function main(config) {
    const puppeteerWrapper = await getPuppeteerWrapper(config.chromeIpAddressOrDomain, config.chromeDebugPort);
    const browser = puppeteerWrapper.browser;
    const japscanPage = puppeteerWrapper.firstPage;

    const bookDirectoryPath = `${config.outputPath}/${config.bookName}`;
    const chaptersInfo = await scrapeChaptersInfo(japscanPage, config.startAtChapter, config.endAtChapter);
    try{
        for(let chapterObj of chaptersInfo){
            let urlToChapter = config.patternChapterUrl.replace('<chapterNumber>', chapterObj.chapterNumber);
            await navigateToChapter(japscanPage, urlToChapter, config.navigationTimeout);
            await scrapeChapterPages(japscanPage, bookDirectoryPath, chapterObj.chapterName, config.dryRun);
            console.log(`chapter ${chapterObj.chapterNumber} downloaded - ${urlToChapter}`);
        }
    }catch(e){
        console.error(`error downloading chapter`);
        console.error(e);
    }

    browser.disconnect();
}

main(config);
