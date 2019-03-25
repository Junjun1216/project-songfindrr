"use strict";
const express = require('express');
const cors = require('cors');

const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const request = require('request');
const cheerio = require('cheerio');
const nedb = require('nedb');
const songLyrics = new nedb({ filename: 'db/song.db', autoload: true, timestampData: true});
let pages = 1;

const cookie = require('cookie');

const googleApi = require('./lib/googleApi');
const geniusScrape = require('./lib/geniusScrape');
const azScrape = require('./lib/azScrape');

// -------------------------------------------------------------------------------------------------------------------//
// cross source calls

// curl -X POST -H "Content-Type: application/json" -d '{"query":"react"}' http://localhost:3001/api/crossSearch/
// crossSource search given a query and returns a list of songs
app.post('/api/crossSearch/', async function (req, res, next) {
    console.log('Query sent to CustomSearch...');
    let googleQuery = await googleApi.customSearch(req.body.query);
    console.log('Done');
    console.log('Genius Scrape Starting...');
    let geniusQuery = await geniusScrape.geniusSearch(req.body.query);
    console.log('Done');
    //todo: elasticdb query
    let container = mergeSources(geniusQuery, googleQuery);
    //todo: add container data to db in a seperate call for speed ideally
    //todo: merge container with elastic query results
    let queriedSongs = [req.body.query];
    for (let i in container) queriedSongs.push({cleanAuthor: container[i].cleanAuthor, cleanTitle:container[i].cleanTitle});
    res.setHeader('Set-Cookie', cookie.serialize('querySongs', queriedSongs, {
        SameSite: true,
        Secure: true,
        path : '/',
        maxAge: 60 * 30
    }));
    res.json(container);
});

// -------------------------------------------------------------------------------------------------------------------//
// az scrape calls

// curl -X POST -H "Content-Type: application/json" -d '{"query":"react"}' http://localhost:3000/api/lyrics/
// return a song list given a query
app.post('/api/azlyrics/', async function (req, res, next) {
    console.log('Searching Az for ' + req.body.query + ' for 1 page');
    for (let x = 0; x < pages; ++x) {
        let queriedData = await azScrape.scrapeAzSearch('https://search.azlyrics.com/search.php?q=' + req.body.query + '&w=songs&p=' + (x+1));
        let count = 0;
        console.log('fetching lyrics');
        for (let index in queriedData) {
            let lyrics = await azScrape.getLyric(queriedData[index].link);
            queriedData[index]['lyrics'] = lyrics.substring(0, 30);
            songLyrics.insert(queriedData[index]);
            if (count == 5) break;
            ++count;
        }
        console.log('done');
        res.json(queriedData);
    }
});

// find the lyrics for a list of songs and add to db
app.post('/api/lyric/', async function (req, res, next) {
    let data = req.body.data;
    for (let index in data) {
        let lyrics = await getLyric(data[index].link);
        data[index]['lyrics'] = lyrics;
        songLyrics.insert(data[index]);
    }
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

// -------------------------------------------------------------------------------------------------------------------//
// util functions

function mergeSources(x, y) {
    if (x[0] === false) return y;
    if (y[0] === false) return x;
    let container = x;
    for (let i = 0; i < y.length; i++) {
        let found = false;
        for (let j = 0; j < x.length; j++) {
            if (x[j].cleanTitle === y[i].cleanTitle
                && x[j].cleanAuthor === y[i].cleanAuthor) {
                container[j].rating = container[j].rating + 5 - i;
                found = true;
            }
        }
        if (!found) container.push(y[i]);
    }
    let pigeonhole = [];
    for (let k = 0; k < container.length; k++) {
        if (pigeonhole[container[k].rating]) {
            pigeonhole[container[k].rating].push(container[k]);
        } else {
            pigeonhole[container[k].rating] = [container[k]];
        }
    }
    container = [];
    for (let k = 0; k < pigeonhole.length; k++) {
        if (pigeonhole[k]) {
            for (let i = pigeonhole[k].length; i > 0; i--) {
                container.unshift(pigeonhole[k][i - 1])
            }
        }
    }
    return container;
}

const http = require('http');
const PORT = 3001;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});