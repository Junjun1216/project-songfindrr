const request = require('request');
const cheerio = require('cheerio');
const nedb = require('nedb');
const azLinks = new nedb({ filename: '../db/azlinks.db', autoload: true, timestampData: true});
let baseLinks = ['a.html', 'b.html', 'c.html', 'd.html', 'e.html', 'f.html', 'g.html', 'h.html',
                'i.html', 'j.html', 'k.html', 'l.html', 'm.html', 'n.html', 'o.html', 'p.html',
                'q.html', 'r.html', 's.html', 't.html', 'u.html', 'v.html', 'w.html', 'x.html',
                'y.html', 'z.html', '19.html'];

function fetchLinks (url, alpha) {
    return new Promise(function (resolve, reject) {
        request(url, (err, res, html) => {
            if (res.statusCode == 200) {
                const $ = cheerio.load(html);
                $('.artist-col').each((i, el) => {
                    let urls = $(el).find('a');
                    urls.each((index, element) => {
                        let linkObject = {_id: element.children[0].data, author: element.children[0].data, link:element.attribs.href, alpha: alpha, fullScraped: false};
                        azLinks.insert(linkObject);
                    });
                });
                resolve(1);
            } else {
                console.log(res.statusCode);
                reject(res.statusCode);
            }
        });
    });
}

async function fetchAllAuthorLinks(baseLinks) {
    for (let x = 0; x < baseLinks.length; ++x) {
        console.log('scraping ' +baseLinks[x]);
        let result = await fetchLinks('https://www.azlyrics.com/' + baseLinks[x], baseLinks[x][0]);
        console.log(result + ' done');
    }
}


function fetchLyricsLinks(authorLink) {
    return new Promise(function (resolve, reject) {
        let url = 'https://www.azlyrics.com/' + authorLink;
        console.log(url);
        request(url,(err, res, html) => {
            if (res.statusCode == 200) {
                const $ = cheerio.load(html);
                let songs = [];
                let queriedSongs = $('#listAlbum').find('a');
                if (queriedSongs.text() == '') {
                    queriedSongs = $('.col-md-6').find('a');
                }
                console.log(queriedSongs.text());
                queriedSongs.each((i, el) => {
                    let song = $(el).text();
                    let songLink = $(el)[0].attribs.href;
                    let songObj = {songlink: songLink, songName: song};
                    songs.push(songObj);
                });
                azLinks.update({link: authorLink}, {$set: {songs: songs, fullScraped: 'partial'}}, {multi: true});
                resolve(1);
            } else {
                console.log(res.statusCode);
                console.log(authorLink + ' did not work');
                reject(res.statusCode);
            }
        });
    });
}

function getAllAuthors(alpha) {
    return new Promise(function (resolve, reject) {
        let authors;
        azLinks.find({alpha: alpha, fullScraped: false}, async function (err, result) {
            authors = result;
        });
        setTimeout(function () {
            resolve(authors);
        }, 3000);
    });
}

async function fetchAllLyricsLinks() {
    console.log('fetching all authors from db');
    let authors = await getAllAuthors('a');
    console.log('done');
    for (let x = 0; x < authors.length; ++x) {
        console.log('scraping ' + 'https://www.azlyrics.com/' + authors[x].link);
        await fetchLyricsLinks(authors[x].link);
        console.log('done');
    }
}

fetchAllAuthorLinks(baseLinks);
fetchAllLyricsLinks();