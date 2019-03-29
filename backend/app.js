"use strict";
const express = require('express');
const cors = require('cors');

const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const cookie = require('cookie');

const Promise = require('bluebird');

const googleApi = require('./lib/googleApi');
const geniusScrape = require('./lib/geniusScrape');
const elastic = require('./lib/elastic');

// -------------------------------------------------------------------------------------------------------------------//
// cross source calls

// curl -X POST -H "Content-Type: application/json" -d '{"query":"react"}' http://localhost:3001/api/crossSearch/
// crossSource search given a query and returns a list of songs
app.post('/api/crossSearch/', async function (req, res, next) {
    console.log('Query sent to CustomSearch...');
    console.log('Genius Scrape Starting...');
    Promise.join(googleApi.customSearch(req.body.query), geniusScrape.geniusSearch(req.body.query), elastic.elasticSearch(req.body.query), function(googleQuery, geniusQuery, elasticQuery){
        console.log('Done');
        let newResult = mergeSources(geniusQuery, googleQuery);
        let allResult = mergeSources(newResult, elasticQuery);
        if (!allResult[0]) return res.status(404).end('No results found');
        let queriedSongs = [req.body.query];
        for (let i in allResult) queriedSongs.push({cleanAuthor: allResult[i].cleanAuthor, cleanTitle:allResult[i].cleanTitle});
        res.setHeader('Set-Cookie', cookie.serialize('querySongs', queriedSongs, {
            SameSite: true,
            Secure: true,
            path : '/',
            maxAge: 60 * 30
        }));
        res.json(allResult);
        Promise.map(newResult, function(song) {
            console.log('Scraping ' + song.title + ' by: ' + song.author);
            return geniusScrape.getLyrics(song.link);
        }, {concurrency: 5}).then(async function(lyrics) {
            console.log(lyrics.length + ' good response');
            for (let index in newResult) {
                newResult[index]['lyrics'] = lyrics[index];
                let res = await elastic.addSong(newResult[index])[0];
                console.log(res);
            }
        }, function(error) {
            console.log(error);
            console.log('error: new data not stored');
        });
    });
});

// curl -X GET -H "Content-Type: application/json" -d '{"cleanAuthor": "DRAKE", "cleanTitle": "THELANGUAGE"}' http://localhost:3001/api/getLyrics/
//get song info from elastic given its authors and titles
app.get('/api/fetchLyrics/', async function(req, res, next) {
    let result = await elastic.getLyric(req.headers.cleanauthor, req.headers.cleantitle);
    if (!result) return res.status(404).end();
    console.log(result);
    return res.json(result);
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