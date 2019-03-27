"use strict";
// const path = require('path');
const express = require('express');
var cors = require('cors')

const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())
// app.use(express.static('frontend'));

const request = require('request');
const cheerio = require('cheerio');
const nedb = require('nedb');
const songLyrics = new nedb({ filename: 'db/song.db', autoload: true, timestampData: true});
let pages = 1;


// elasticsearch component
let elasticsearch = require('elasticsearch');
let Client = new elasticsearch.Client({
    host: 'localhost:9200',
});

// ping the client
Client.ping({
    requestTimeout: 10000}, function(err) {
    if (err) {
        console.error('elasticsearch cluster is down!');
    }
    else {
        console.log('all is well');
    }
});

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
                    // removed _id field
                    queriedData.push({author: author, title: title, link: ref});
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

app.get('/api/lyrics/', function (req, res, next) {
    console.log ('searching elasticsearch for ' + req.body.lyric);
    Client.search({
        index: 'songs',
        type: '_doc',
        body: /*{
            "query": {
                "query_string": {
                    "default_field" : "lyrics",
                    "query" : req.body.lyric
                }

            }
        }*/
        {
            "query" : {
                "bool": {
                    "should": [{
                        "bool" : {
                             "must": [
                             {
                                 "match_phrase": { "lyrics": req.body.lyric }
                             }

                        ],
                        // boost the _score if whole phrase matches
                        "boost" : 3.0
                    }
                }, {
                    "bool" : {
                        "must" : [
                            {
                                "match": {"lyrics" : req.body.lyric}
                            }
                        ]
                    }
        	    }]
            }
        }

    }
    }, function(err, result) {
        if (err) {
            console.log(err);
        }
        else {
            result.hits.hits.forEach(function(hit) {
                console.log(hit);
            });
            res.end("done");
        }
    });
});

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
            // this is where we insert the song into db
            // songLyrics.insert(queriedData[index]);
            Client.search({
                index: 'songs',
                type: '_doc',
                body: {
                    "query": {
                        "bool": {
                            "must": [
                            {
                                "match": { author: queriedData[index]['author'] }
                            },
                            {
                                "match": { title: queriedData[index]['title'] }
                            }

                        ]
                    }
                }
            }
            }, function(err, result){
                if (err || result.hits.hits.length == 0) {
                    console.log('index does not exist');
                    console.log(err);
                    Client.index({
                        index: "songs",
                        type: "_doc",
                        body: queriedData[index]
                    }, function(err, result) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log(result);
                        }
                    });
                }
                else {
                    console.log('index exists');
                    //console.log(result);
                    // result.hits.hits.foreach and then get author/title/link
                }
            });

            if (count == 5) break;
            ++count;
        }
        console.log('done');
        res.json(queriedData);
    }
});

// gets the rest of the lyrics into the db as well
app.post('/api/lyrics/', async function (req, res, next) {
    let data = req.body.data;
    for (let index in data) {
        let lyrics = await getLyric(data[index].link);
        data[index]['lyrics'] = lyrics;
        // songLyrics.insert(data[index]);
        // replace with elasticsearch
        Client.exists({
            index: 'songs',
            type: '_doc'
        }, function(err, result){
            if (err) {
                console.log('index does not exist');
            }
            else {
                console.log('index exists');
            }
        })
        /*Client.index({
            index: "songs",
            type: "_doc",
            body: queriedData[index]
        }, function(err, result) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(result);
            }
        });*/
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
const PORT = 3001;

http.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});