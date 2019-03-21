const request = require('request');
let url = 'https://www.googleapis.com/customsearch/v1?';
let apiKey = 'AIzaSyBwzcTxXjfbAMZGpXiyT7OiKx9_oKSaF-s';
let engineId = '014928307931634836673:fw2xtr7plgi';
let query = encodeURIComponent('feeling like i\'m cool');

let payload = url + 'key=' + apiKey + '&cx=' + engineId + '&q=' + query;

request.get(payload, function (err, res, body) {
    let results = JSON.parse(body).items;
    for (let x = 0; x < results.length; ++x) {
        console.log(results[x].title);
        console.log(results[x].link);
    }
});
