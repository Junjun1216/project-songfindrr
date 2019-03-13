"use strict";
// const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(express.static('frontend'));

const request = require('request');
const cheerio = require('cheerio');
const nedb = require('nedb');
const songLyrics = new nedb({ filename: 'db/song.db', autoload: true, timestampData: true});
let pages = 1;

function scrapeAzSearch(url) {
    return new Promise(function (resolve, reject) {
        let queriedData = [];
        request(url, (err, res2, html) => {
            if (!err && res2.statusCode == 200) {
                const $ = cheerio.load(html);
                $('.visitedlyr').each((i, el) => {
                    const title = $(el).find('a').text();
                    const ref = $(el).find('a').attr('href');
                    const author = $(el).find('b').eq(1).text();
                    queriedData.push({_id: author, title: title, link: ref});
                });
                resolve(queriedData);
            } else {
                reject(error);
            }
        });
    })
}

function getLyric(link) {
    return new Promise(function (resolve, reject) {
        request(link, (err, res, html) => {
            if (!err && res.statusCode == 200) {
                const $ = cheerio.load(html);
                let lyrics = $('.ringtone').nextAll().eq(3).text();
                if (lyrics == '') {
                    lyrics = $('.ringtone').nextAll().eq(5).text();
                }
                lyrics = lyrics.replace(/\n\n/g, '').replace(/\n/g, ' ');
                resolve(lyrics);
            } else {
                reject(err.statusCode);
            }
        });
    });
}

//  curl -X POST -H "Content-Type: application/json" -d '{"query":"react"}' http://localhost:3000/api/lyrics/
app.post('/api/lyrics/', async function (req, res, next) {
    console.log('Searching Az for ' + req.body.query + ' for 1 page');
    for (let x = 0; x < pages; ++x) {
        // request('https://search.azlyrics.com/search.php?q=' + req.body.query + '&w=songs&p=' + (x+1), (err, res2, html) => {
        //     if (!err && res2.statusCode == 200) {
        //         const $ = cheerio.load(html);
        //         $('.visitedlyr').each((i, el) => {
        //             const title = $(el).find('a').text();
        //             const ref = $(el).find('a').attr('href');
        //             const author = $(el).find('b').eq(1).text();
        //             queriedData[author] = {author: author, title: title, link: ref};
        //             songLyrics.insert({_id: author, title: title, link: ref});
        //         });
        //     } else {
        //         console.log(res2.statusCode);
        //         res.statusCode(503).end('server unavailable');
        //     }
        // });

        let queriedData = await scrapeAzSearch('https://search.azlyrics.com/search.php?q=' + req.body.query + '&w=songs&p=' + (x+1));
        let count = 0;
        console.log('fetching lyrics');
        for (let index in queriedData) {
            let lyrics = await getLyric(queriedData[index].link);
            queriedData[index]['lyrics'] = lyrics;
            songLyrics.insert(queriedData[index]);
            if (count == 5) break;
            ++count;
        }
        console.log('done');
        res.json(queriedData);
    }
});

app.post('/api/lyrics/', async function (req, res, next) {
    let data = req.body.data;
    for (let index in data) {
        let lyrics = await getLyric(data[index].link);
        data[index]['lyrics'] = lyrics;
        songLyrics.insert(data[index]);
    };
});

// curl -X GET http://localhost:3000/api/lyrics/React/ReactValora
app.get('/api/lyrics/:title/:author', function(req, res, next) {
    songLyrics.findOne({title: req.params.title, _id: req.params.author}, function (err, song) {
        if (!song) return res.status(404).end('title not found');
        request(song.link, (err, res, html) => {
            if (!err && res.statusCode == 200) {
                const $2 = cheerio.load(html);
                let lyrics = $2('.ringtone').nextAll().eq(3).text();
                if (lyrics == '') {
                    lyrics = $2('.ringtone').nextAll().eq(5).text();
                }
                lyrics = lyrics.replace(/\n\n/g, '').replace(/\n/g, ' ');
                songLyrics.update({_id: song._id}, {lyrics:lyrics}, function(err, changes) {
                    return res.json(lyrics);
                });
            } else {
                console.log(res.statusCode);
                res.statusCode(503).end('server unavailable');
            }
        });
    });
});

const http = require('http');
const PORT = 3000;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});