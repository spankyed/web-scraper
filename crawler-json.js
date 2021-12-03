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

function save(item, overwrite, path = './docs/collection.json'){
    if (!fs.existsSync(path) || overwrite) {
        fs.writeFile(path, JSON.stringify([item]));
    } else {
        var data = fs.readFileSync(path, 'utf8');  
        var list = (data.length) ? JSON.parse(data): [];
        if (list instanceof Array) list.push(item)
        else list = [item]  
        fs.writeFileSync(path, JSON.stringify(list));
    }
}

const scrapePages = async () => {
    var currPage = 0, docsCount = 0, limit = 25 ;
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
            save({id: instance(), title, text}, (docsCount==0)) // overwrite if no docs saved to json
            console.log(`\n document ${docsCount} added: ${title}`) 
        }));     
    }
}

scrapePages()

