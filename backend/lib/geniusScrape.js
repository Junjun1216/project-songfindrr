"use strict";
let geniusScrape = module.exports = {};
const path = require('path');
const Nightmare = require('nightmare');
// set show to false to turn off browser
const nightmare = Nightmare({
    show: false,
    // load custom preload file
    webPreferences: {
        preload: path.resolve(__dirname, 'custPreload.js')
    }
});

geniusScrape.geniusSearch = async function(query) {
    let encodedQuery = encodeURIComponent(query);
    return await nightmare
        .goto('https://genius.com/search?q=' + encodedQuery)
        .scrollTo(1500, 0)
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
            let queriedData = [{statusCode: 404, message: '404 bad query'}];
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
                    rating: 5 - i
                };
            });
            return queriedData;
        })
        .end();
};