const request = require('request');
let url = 'https://www.googleapis.com/customsearch/v1/siterestrict?';
let apiKey = 'AIzaSyBwzcTxXjfbAMZGpXiyT7OiKx9_oKSaF-s';
let engineId = '014928307931634836673:fw2xtr7plgi';
let query = encodeURIComponent('react');

let payload = url + 'key=' + apiKey + '&cx=' + engineId + '&q=' + query;
let queryData = [{statusCode: 404, message: '404 bad query'}];
let count = 0;

request.get(payload, function (err, res, body) {
    if(err) {
        return 0;
    }
    let results = JSON.parse(body).items;
    for (let x = 0; x < results.length; ++x) {
        // special longer dash '–'
        let titleSegments = results[x].title.split('–');
        if (titleSegments.length > 1) {
            let title = titleSegments[0].trim();
            let cleanTitle = title
                .replace(/\s/g, '')
                .replace(/[()'.&?/-]/g, '')
                .toUpperCase();
            let author = titleSegments[1].split('|')[0].replace('Lyrics', '').trim();
            let cleanAuthor = author
                .replace(/\s/g, '')
                .replace(/[()'.&?/-]/g, '')
                .toUpperCase();
            if (results[x].link.toString().includes('lyrics')) {
                queryData[count] = ({title: title, cleanTitle: cleanTitle, author: author, cleanAuthor: cleanAuthor, rating: 5-count});
                count++;
            }
        }
    }
    console.log(queryData);
});
