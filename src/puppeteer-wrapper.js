import puppeteer from 'puppeteer-core';

/**
 * 
 * @param {port} the debug port set to chrome.exe using --remote-debugging-port=<your port> option. Default in the example is 9222
 * @returns the chrome debug websocket url, example: ws://127.0.0.1:9222/devtools/browser/1c4b7b7b-7b7b-4b7b-7b7b-7b7b7b7b7b7b
 */
async function getWebSocketDebuggerUrl(chromeIpAddressOrDomain, chromeDebugPort) {
    try{
        const response = await fetch(`http://${chromeIpAddressOrDomain}:${chromeDebugPort}/json/version`);
        const data = await response.json();
        return data.webSocketDebuggerUrl;
    }catch(e){
        console.error('Error getting websocket, maybe chrome is not running in remote debug mode? ');
        console.error('chrome.exe --remote-debugging-port=<your port> (default in example is 9222) - See details in doc');
        process.exit(1);
    }
}


/**
 * Wraps the puppeteer.connect method, connecting to a chrome instance that is already running in remote debug mode
 * @param {chromeIpAddressOrDomain} the ip address or domain of the chrome instance
 * @param {chromeDebugPort} the debug port set to chrome.exe using --remote-debugging-port=<your port> option. Default in the example is 9222
 * @returns the puppeteer browser object and the first page
 */
async function getPuppeteerWrapper(chromeIpAddressOrDomain, chromeDebugPort){
    const websocketUrlChromeDebug = await getWebSocketDebuggerUrl(chromeIpAddressOrDomain, chromeDebugPort);
    let browser = await puppeteer.connect({
        browserWSEndpoint: websocketUrlChromeDebug,
        defaultViewport: null,
    });

    console.log('connected to browser');
    console.log('Keep the Google Chrome always on focus, or it will process');
    const pages = await browser.pages();
    const firstPage = pages[0];
    return {browser, firstPage};
}

export { getPuppeteerWrapper };