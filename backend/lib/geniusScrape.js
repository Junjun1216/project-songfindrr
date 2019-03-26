"use strict";
let geniusScrape = module.exports = {};
const path = require('path');
const Nightmare = require('nightmare');
let nightmare = [];
let iteration = 0;
for (let i = 0 ; i < 9; i++) {
    nightmare.push(Nightmare({
        show: false,
        // load custom preload file
        webPreferences: {
            preload: path.resolve(__dirname, 'custPreload.js')
        }
    }));
}

geniusScrape.getLyrics = async function(link) {
    iteration = (iteration === 9) ? iteration + 1 : 0;
    return await nightmare[iteration]
        .goto(link)
        .evaluate(() => {
            let lyrics = '';
            $('.referent').each(function (i, el) {
                lyrics = lyrics + $(el).text() + '\n';
            });
            return lyrics;
        })
        .end();
};

geniusScrape.geniusSearch = async function(query) {
    iteration = (iteration === 9) ? iteration + 1 : 0;
    let encodedQuery = encodeURIComponent(query);
    return await nightmare[iteration]
        .goto('https://genius.com/search?q=' + encodedQuery)
        // .scrollTo(1500, 0)
        .evaluate(() => {
            if ($('.full_width_button').eq(0).text().replace(/\n/g, ' ').trim()
                == 'Show more lyric matches') {
                $('.full_width_button').eq(0).click();
            } else if ($('.full_width_button').eq(1).text().replace(/\n/g, ' ').trim()
                == 'Show more lyric matches') {
                $('.full_width_button').eq(1).click();
            }
        })
        .wait(1000) //not good
        .evaluate(() => {
            let queriedData = [false];
            $('.u-display_block').each(function (i, el) {
                if (i === 5) {
                    return false;
                }
                let link = $(el).find('.mini_card-thumbnail').parent().attr('href');
                let title = $(el).find('.mini_card-title').text()
                    .replace(/\n/g, '')
                    .trim();
                let cleanTitle = title
                    .replace(/\s/g, '')
                    .replace(/[()'.&?/,-]/g, '')
                    .replace(/\u200B/g, '')
                    .toUpperCase();
                let author = $(el).find('.mini_card-subtitle').text()
                    .replace(/\n/g, '')
                    .trim();
                let cleanAuthor = author
                    .replace(/\s/g, '')
                    .replace(/[()'.&?/,-]/g, '')
                    .replace(/\u200B/g, '')
                    .toUpperCase();
                queriedData[i] = {
                    author: author,
                    title: title,
                    cleanAuthor: cleanAuthor,
                    cleanTitle: cleanTitle,
                    link: link,
                    rating: 5 - i,
                    source: 'genius'
                };
            });
            return queriedData;
        })
        .end();
};