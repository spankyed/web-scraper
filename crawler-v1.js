const fs = require('fs-extra');
const playwright = require('playwright');

var docsCount = 0
var limit = 2
var currPage = 0

function getPageUrl (page) { return `https://jkrishnamurti.org/jksearch?keyword=&page=${page}&media_type=16616` }
async function saveData (name, text) { return fs.writeFile(`docs/${name}.txt`,text) }

const scrapePages = async () => {
    let browser = await playwright.chromium.launch();
    let page = await browser.newPage();

    while (docsCount < limit) {
        currPage++
        await page.goto( getPageUrl(currPage) );
        const links = await page.$$eval('.title >> a', anchors => [].map.call(anchors, a => a.href));
        
        for(let linkCount = 0; linkCount < links.length; linkCount++ ){
            if (docsCount >= limit) break;
            let link = links[linkCount]
            await page.goto(link).catch((err) => console.error(err))
            let name = link.split('/')[4]            
            let text = await page.$eval('.custom-center >> .field__item', p => p.textContent);              
            await saveData(name, text)
            console.log(`document saved: ${name} \n`)
            docsCount++
        }  
    }

    console.log(`Finished collecting ${docsCount} documents at page ${currPage}`)

    await browser.close();  
}

scrapePages();