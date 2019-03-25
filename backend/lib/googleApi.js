"use strict";
let googleApi = module.exports = {};

const request = require('request');
const url = 'https://www.googleapis.com/customsearch/v1/siterestrict?';
const apiKey = 'AIzaSyBwzcTxXjfbAMZGpXiyT7OiKx9_oKSaF-s';
const engineId = '014928307931634836673:fw2xtr7plgi';

googleApi.customSearch = async function(query) {
    let count = 0;
    let encodedQuery = encodeURIComponent(query);
    let payload = url + 'key=' + apiKey + '&cx=' + engineId + '&q=' + encodedQuery;
    let queryData = [false];
    return new Promise(function (resolve, reject) {
        request.get(payload, function (err, res, body) {
            if (err) {
                queryData[0] = err.statusCode;
                resolve(queryData);
            }
            let results = JSON.parse(body).items;
            for (let x = 0; x < results.length; ++x) {
                if (count == 5) break;
                // special longer dash '–'
                let titleSegments = results[x].title.split('–');
                if (titleSegments.length > 1) {
                    let link = results[x].link;
                    let author = titleSegments[0].trim();
                    let title = titleSegments[1].split('|')[0].replace('Lyrics', '').trim();
                    let cleanAuthor = author
                        .replace(/\s/g, '')
                        .replace(/[()'.&?/,-]/g, '')
                        .toUpperCase();
                    let cleanTitle = title
                        .replace(/\s/g, '')
                        .replace(/[()'.&?/,-]/g, '')
                        .toUpperCase();
                    if (link.toString().includes('lyrics')) {
                        queryData[count] = ({
                            title: title,
                            cleanTitle: cleanTitle,
                            author: author,
                            cleanAuthor: cleanAuthor,
                            link: link,
                            rating: 5 - count,
                            source: 'google'
                        });
                        count++;
                    }
                }
            }
            resolve(queryData);
        });
    });
};

