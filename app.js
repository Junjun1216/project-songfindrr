"use strict";
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const cookie = require('cookie');
const promise = require('bluebird');
const validator = require('validator');

const googleApi = require('./lib/googleApi');
const geniusScrape = require('./lib/geniusScrapePuppeteer');
const elastic = require('./lib/elastic');

// -------------------------------------------------------------------------------------------------------------------//
// cross source calls

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    })
}

let sanitizeContent = (req, res, next) => {
    req.body.content = validator.escape(req.body.query);
    next();
};

// curl -X POST -H "Content-Type: application/json" -d '{"query":"react"}' http://localhost:3001/api/crossSearch/
// crossSource search given a query and returns a list of songs
app.post('/api/crossSearch/', sanitizeContent,  async (req, res, next) => {
    console.log('New CrossSearch Staring: ' + req.body.query);
    promise.join(googleApi.customSearch(req.body.query), geniusScrape.geniusSearch(req.body.query), elastic.elasticSearch(req.body.query), async (googleQuery, geniusQuery, elasticQuery) => {
        console.log('Done');
        let newResult = mergeSources(geniusQuery, googleQuery);
        let allResult = mergeSources(newResult, elasticQuery);
        console.log(newResult.length + ' new results');
        console.log(elasticQuery.length + ' db results');
        console.log(allResult.length + ' unique results');
        if (!allResult[0]) return res.status(404).end('No results found');
        let queriedSongs = [];
        for (let i in allResult) queriedSongs.push({author: allResult[i].author, title: allResult[i].title, cleanAuthor: allResult[i].cleanAuthor, cleanTitle: allResult[i].cleanTitle});
        queriedSongs = JSON.stringify(queriedSongs);
        res.setHeader('Set-Cookie', cookie.serialize('querySongs', queriedSongs, {
            SameSite: true,
            Secure: true,
            path : '/',
            maxAge: 60 * 30
        }));
        res.json(allResult);
        if (newResult[0]) {
            let resultGroup = [];
            let size = 3;
            while (newResult.length > 0) resultGroup.push(newResult.splice(0, size));
            for (let index in resultGroup) await processLyrics(resultGroup[index]);
        }
    });
});

// curl -X GET -H "Content-Type: application/json" -d '{"cleanAuthor": "DRAKE", "cleanTitle": "THELANGUAGE"}' http://localhost:3001/api/fetchLyrics/
//get song info from elastic given its authors and titles
app.post('/api/fetchLyrics/', async (req, res, next) => {
    let result = await elastic.getLyric(req.body.cleanAuthor, req.body.cleanTitle);
    if (!result) return res.status(404).end('No Song Found With Query: ' + req.body.cleanTitle + '-' + req.body.cleanAuthor);
    return res.json(result);
});

// -------------------------------------------------------------------------------------------------------------------//
// util functions

/**
 * background process for fetching lyrics after crossSearch fetched authors and titles
 * @param {list} newResult is a list of song objects
 * @returns {promise<int>} number of failed fetch instances
 */
async function processLyrics(newResult) {
    if (newResult[0]) {
        for (let i = 0; i < newResult.length; i++) {
            if (await elastic.checkExistence(newResult[i])) {
                newResult.splice(i, 1);
                i--;
            }
        }
        let failed = 0;
        promise.map(newResult, (song) => {
            console.log('Scraping ' + song.title + ' by: ' + song.author);
            return geniusScrape.getLyrics(song.link);
        }, {concurrency: 20}).then(async (lyrics) => {
            for (let index in lyrics) {
                if (lyrics[index] !== '' && lyrics[index]) {
                    newResult[index]['lyrics'] = lyrics[index];
                    await elastic.addSong(newResult[index]);
                } else {
                    console.log('Lyrics Scrape Failed: ' + newResult[index].title);
                    failed++;
                }
            }
            console.log('Done Fetching Lyrics, With ' + failed + ' Fails Out Of ' + lyrics.length);
            return failed;
        });
    }
    return 0;
}

/**
 * for comparing and merging different sources in crossSearch results
 * @param {list} x
 * @param {list} y
 * @returns {list} list of song objects
 */
function mergeSources(x, y) {
    if (x[0] === false) return y;
    if (y[0] === false) return x;
    let container = JSON.parse(JSON.stringify(x));
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
const PORT = process.env.PORT || 3001;

http.createServer(app).listen(PORT, (err) => {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});