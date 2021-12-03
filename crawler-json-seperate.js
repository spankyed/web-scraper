const fs = require('fs-extra');
const got = require('got');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const hyperid = require('hyperid');
const instance = hyperid()

function getPageUrl (page) { return `https://jkrishnamurti.org/jksearch?keyword=&page=${page}&media_type=16616` }

async function getDOM (url) {
    const page = await got(url)
    const { window } = new JSDOM(page.body)
    return window.document
}

async function save (name, item) { return fs.writeFile(`docs/${name}.json`, JSON.stringify([item])); }

const scrapePages = async () => {
    var currPage = 0, docsCount = 0, limit = 200; 
    while (docsCount < limit) {
        currPage++     
        let document = await getDOM( getPageUrl(currPage) )
        const links = [ ...document.querySelectorAll('.title > a')].map( link => link.href)

        await Promise.all( links.map(async (link,i) => {
            if (docsCount >= limit) return;   
            docsCount++
            let title = link.split('/')[2]     
            let document = await getDOM(`https://jkrishnamurti.org` + link)
            let text = document.querySelector('.custom-center .field__item').textContent 
            await save(`${i}-${currPage}`,{ title, text} ) // overwrite if no docs saved to json
            console.log(`\n document ${docsCount} added: ${title}`) 
        }));   
    }
}

scrapePages()

