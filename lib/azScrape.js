"use strict";
let azScrape = module.exports = {};
const request = require('request');
const cheerio = require('cheerio');

azScrape.scrapeAzSearch = async function(url) {
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
};

azScrape.getLyric = async function(link) {
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
};