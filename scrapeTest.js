"use strict";
const path = require('path');
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

// elasticsearch component
let elasticsearch = require('elasticsearch');
let client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
});

// ping the client
client.ping({
    requestTimeout: 10000}, function(err) {
    if (err) {
        console.error('elasticsearch cluster is down!');
        //console.log(err);
    }
    else {
        console.log('all is well');
    }
});


 //sample of how to add to elasticseach
/*client.index({
    index: "indexfromnode",
    // types are deprecated now, it's always _doc
    type: "_doc",
    body: {
        text: "hello world from node"
    }
}, function(err, res) {
    if (err) {
        console.log(err);
    }
    else {
        console.log(res);
    }
});*/

//  curl -X POST -H "Content-Type: application/json" '{"query":"react"}' http://localhost:3000/api/lyrics/
app.post('/api/lyrics/', function (req, res, next) {
    let queriedData = {};
    for (let x = 0; x < pages; ++x) {
        request('https://search.azlyrics.com/search.php?q=' + req.body.query + '&w=songs&p=' + (x+1), (err, res2, html) => {
            if (!err && res.statusCode == 200) {
                const $ = cheerio.load(html);
                $('.visitedlyr').each((i, el) => {
                    const title = $(el).find('a').text();
                    const ref = $(el).find('a').attr('href');
                    const author = $(el).find('b').eq(1).text();
                    queriedData[author] = {author: author, title: title, link: ref};
                    // songLyrics.insert({_id: author, title: title, link: ref});
                    // think about replacing the bottom with add bulk
                    client.index({
                        index: "songs",
                        type: "_doc",
                        body: {
                            title: title,
                            author: author,
                            link: ref
                        }
                    }, function(err, res) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log(res);
                        }
                    });
                });
                return res.json(queriedData);
            } else {
                console.log(res.statusCode);
                res.statusCode(503).end('server unavailable');
            }
        });
    }
});

// changed 
// curl -X GET http://localhost:3000/api/lyrics/KnifeSkinnyfromthe9
// curl -X GET http://localhost:3000/api/lyrics/React/ReactValora
app.get('/api/lyrics/:title/:author', function(req, res, next) {
/*    songLyrics.findOne({title: req.params.title, _id: req.params.author}, function (err, song) {
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
    });*/

    // use _updatebyquery to find and update object

/*    client.updateByQuery({
        index: "songs",
        type: "_doc",
        body: {
            "query": {
                "bool": {
                    "must": [
                        {
                            "match": { author: req.params.author }
                        },
                        {
                            "match": { title: req.params.title }
                        }
                    ]
                }
            },

            *//*"script": { "inline": "ctx._source.lyrics = variable",
                "params": {"variable": "another test"}
            }*//*
            "script": { "inline": "ctx._source.lyrics = params.variable",
                "params": {"variable": "some var"}
            }
        }
    }, function (err, result) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(result);
            return res.json("updated");
        }
    })*/

    // lets try again this time with 2 queries

    client.search({
        index: "songs",
        body: {
            "query": {
                "bool": {
                    "must": [
                        {
                            "match": { author: req.params.author }
                        },
                        {
                            "match": { title: req.params.title }
                        }
                    ]
                }
            }
        }
    }, function(err, result) {
        if (err) {
            console.log(err);
        }
        else {
        console.log("START");
            console.log(result);
            console.log("----HITS----");
            result.hits.hits.forEach(function(hit) {
                console.log(hit);
                console.log(hit._id);
                console.log(hit._source.link);
                request(hit._source.link, function(err, res, html) {
                    if (!err && res.statusCode == 200) {
                        const $2 = cheerio.load(html);
                        let lyrics = $2('.ringtone').nextAll().eq(3).text();
                        if (lyrics == '') {
                            lyrics = $2('.ringtone').nextAll().eq(5).text();
                        }
                        lyrics = lyrics.replace(/\n\n/g, '').replace(/\n/g, ' ');

                        return res.json(lyrics);
                    } else {
                        console.log(res.statusCode);
                        res.statusCode(503).end('server unavailable');
                    }
                });
            });
            return res.json("OK");
        }
    })
});

// getting lyrics of song
let thelyrics = function(songLink) {
    request(songLink, function(err, res, html) {
        if (!err && res.statusCode == 200) {
            const $2 = cheerio.load(html);
            let lyrics = $2('.ringtone').nextAll().eq(3).text();
            if (lyrics == '') {
                lyrics = $2('.ringtone').nextAll().eq(5).text();
            }
            lyrics = lyrics.replace(/\n\n/g, '').replace(/\n/g, ' ');
            return lyrics;
        } else {
            console.log(res.statusCode);
            res.statusCode(503).end('server unavailable');
        }
    });
};

const http = require('http');
const PORT = 3000;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});