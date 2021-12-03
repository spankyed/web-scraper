const fs = require('fs-extra');
const got = require('got');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

async function saveData (name, text) { return fs.writeFile(`docs/${name}.txt`,text) }
async function getDOM (url) {
    const page = await got(url)
    const { window } = new JSDOM(page.body)
    return window.document
}
function getPageUrl (page) { return `https://jkrishnamurti.org/jksearch?keyword=&page=${page}&media_type=16616` }

const scrapePages = async () => {
    var docsCount = 0, limit = 2, currPage = 0 ;

    while (docsCount < limit) {
        currPage++     
        let document = await getDOM( getPageUrl(currPage) )
        const links = [ ...document.querySelectorAll('.title > a')].map( link => link.href)
        links.forEach(async link => {
            if (docsCount >= limit) return;
            docsCount++
            let name = link.split('/')[2]     
            let document = await getDOM(`https://jkrishnamurti.org` + link)
            let text = document.querySelector('.custom-center .field__item').textContent           
            await saveData(name, text)
            console.log(`\n document saved: ${name}`)            
        })          
    }

    return `\n Finished collecting ${docsCount} documents at page ${currPage}`
}

scrapePages().then(console.log)


