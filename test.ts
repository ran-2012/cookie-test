import puppeteer, {Page} from 'puppeteer';

import fs from 'fs'
import readline from 'readline'

async function main() {
    await processLineByLine();
}

async function processLineByLine() {
    let data = fs.readFileSync('websites.txt', 'utf8').toString().split('\r\n');

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(10000);
    page.setDefaultTimeout(10000);
    for await (const line of data) {
        await checkPage(page, line);
    }

    await page.close();
    await browser.close();
}

async function checkPage(page: Page, url: string) {
    let file = fs.openSync("result.txt", 'a')
    console.log("==========")
    console.log(url)

    let result: string[] = []
    result.push(url)

    // Launch the browser and open a new blank page
    try {

        // Navigate the page to a URL
        await page.goto(`https://${url}`);

        result.push(url)

        // Set screen size
        await page.setViewport({width: 1920, height: 800});

        let cookie = await page.cookies();
        console.log("cookie count: " + cookie.length);
        console.log(cookie);
        result.push(cookie.length.toString())

        let content = await page.content()

        let acceptAllExp = new RegExp("accept all", 'i')
        let privacyPolicyExp = new RegExp("privacy policy", 'i')
        let cookiePolicyExp = new RegExp("cookie policy", 'i');
        let customizeCookieExp = new RegExp("customize (cookie|settings?)", 'i')
        let necessaryExp = new RegExp("necessary (cookie )?only", 'i')

        let array: RegExp[] = []
        array.push(acceptAllExp, privacyPolicyExp, cookiePolicyExp, customizeCookieExp, necessaryExp)
        for (let exp of array) {
            console.log("Checking " + exp)
            let match = exp.exec(content)
            if (match === null) {
                console.log("No match for " + exp)
                result.push("no")
            } else {
                console.log("Match count: " + match.length)
                result.push("yes")
            }
        }

    } catch (e) {
        console.error(e)
    }

    fs.writeSync(file, result.join(','))
    fs.writeSync(file, "\r\n")
    console.log("==========")
}

main().then(r => console.log("end"))
