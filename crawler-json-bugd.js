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

async function save (name, item) { return fs.outputFile(`docs/${name}.json`,JSON.stringify([item])) }

async function saveFromLink(link,i){ 
    let title = link.split('/')[2]     
    let document = await getDOM(`https://jkrishnamurti.org` + link)
    let text = document.querySelector('.custom-center .field__item').textContent  
    await save(i,{ title, text} ) // overwrite if no docs saved to json
    console.log(`\n document added: ${title}`)                       
    
}

let done = false;
let count = 0;
const whileGenerator = function* () {
    while (!done) {
        yield count;
    }
}

const scrapePages = async () => {
    var currPage = 0, docsCount = 0, limit = 21 , docsPerPage = 10; // limit by x10
    for (let i of whileGenerator()){
        if (docsCount >= limit){
            done = true;
        }
        currPage++      
        docsCount += docsPerPage
        let document = await getDOM( getPageUrl(currPage) )
        let links = [ ...document.querySelectorAll('.title > a')].map( link => link.href)
        links.forEach(saveFromLink) 
     }
}

scrapePages()

