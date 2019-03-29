let googleApi = require('./lib/googleApi');
let geniusApi = require('./lib/geniusScrape');
let elasticDb = require('./lib/elastic');
let Promise = require('bluebird');

async function bluebirdjoin() {
    Promise.join(googleApi.customSearch('react'), geniusApi.geniusSearch('react'), function(googleQuery, geniusQuery) {
        console.log(googleQuery);
        console.log(geniusQuery);
    })
}

// bluebirdjoin();

async function getLyrics() {
    let lyrics = await geniusApi.getLyrics('https://genius.com/Drake-the-language-lyrics');
    console.log(lyrics);
}

// getLyrics();

let songs = [ { title: 'React',
    cleanTitle: 'REACT',
    author: 'Erick Sermon',
    cleanAuthor: 'ERICKSERMON',
    link: 'https://genius.com/Erick-sermon-react-lyrics',
    rating: 5,
    source: 'google' },
    { title: 'Respond/React',
        cleanTitle: 'RESPONDREACT',
        author: 'The Roots',
        cleanAuthor: 'THEROOTS',
        link: 'https://genius.com/The-roots-respond-react-lyrics',
        rating: 4,
        source: 'google' },
    { title: 'React',
        cleanTitle: 'REACT',
        author: 'Onyx',
        cleanAuthor: 'ONYX',
        link: 'https://genius.com/Onyx-react-lyrics',
        rating: 3,
        source: 'google' },
    { title: 'Chemicals React',
        cleanTitle: 'CHEMICALSREACT',
        author: 'Aly & AJ',
        cleanAuthor: 'ALYAJ',
        link: 'https://genius.com/Aly-and-aj-chemicals-react-lyrics',
        rating: 2,
        source: 'google' },
    { title: 'React',
        cleanTitle: 'REACT',
        author: 'Jaylib',
        cleanAuthor: 'JAYLIB',
        link: 'https://genius.com/Jaylib-react-lyrics',
        rating: 1,
        source: 'google' } ];

async function bluebirdmap(songs) {
    let result = songs;
    Promise.map(songs, function(song) {
        return geniusApi.getLyrics(song.link);
    }, {concurrency: 5}).then(function(lyrics) {
         for (let index in result) {
             result[index]['lyrics'] = lyrics[index];
             console.log('\n');
             console.log(lyrics[index]);
         }
         //console.log(result);
    })
}

// bluebirdmap(songs);

let song1 = [{ title: 'React',
    cleanTitle: 'REACT',
    author: 'Erick Sermon',
    cleanAuthor: 'ERICKSERMON',
    link: 'https://genius.com/Erick-sermon-react-lyrics',
    rating: 5,
    source: 'google',
    lyrics: 'Just Blaze, yeah Burn Out'}];

async function elastic(songs) {
    // for (let index in songs) {
    //     await elasticDb.addSong(songs[index]);
    // }
    // let result = await elasticDb.elasticSearch('yeah');
    let result = await elasticDb.getLyric({cleanAuthor: 'ERICKSERMON', cleanTitle: 'REACT'});
    console.log(result);

}

// elastic(song1);

let x = [ { author: 'Drake',
    cleanAuthor: 'DRAKE',
    cleanTitle: 'THELANGUAGE',
    link: 'https://genius.com/Drake-the-language-lyrics',
    rating: 5,
    title: 'The Language' },
    { author: 'Kendrick Lamar',
        cleanAuthor: 'KENDRICKLAMAR',
        cleanTitle: 'SINGABOUTMEIMDYINGOFTHIRST',
        link:
            'https://genius.com/Kendrick-lamar-sing-about-me-im-dying-of-thirst-lyrics',
        rating: 4,
        title: 'Sing About Me, I\'m Dying of Thirst' },
    { author: 'Original Broadway Cast of Hamilton',
        cleanAuthor: 'ORIGINALBROADWAYCASTOFHAMILTON',
        cleanTitle: 'BURN',
        link:
            'https://genius.com/Original-broadway-cast-of-hamilton-burn-lyrics',
        rating: 3,
        title: 'Burn' },
    { author: 'Drake',
        cleanAuthor: 'DRAKE',
        cleanTitle: 'UWITHME',
        link: 'https://genius.com/Drake-u-with-me-lyrics',
        rating: 2,
        title: 'U With Me?' },
    { author: 'Kendrick Lamar',
        cleanAuthor: 'KENDRICKLAMAR',
        cleanTitle: 'MORTALMAN',
        link: 'https://genius.com/Kendrick-lamar-mortal-man-lyrics',
        rating: 1,
        title: 'Mortal Man' } ];

let y = [ { title: 'React',
    cleanTitle: 'REACT',
    author: 'Erick Sermon',
    cleanAuthor: 'ERICKSERMON',
    link: 'https://genius.com/Erick-sermon-react-lyrics',
    rating: 5,
    source: 'google' },
    { title: 'Respond/React',
        cleanTitle: 'RESPONDREACT',
        author: 'The Roots',
        cleanAuthor: 'THEROOTS',
        link: 'https://genius.com/The-roots-respond-react-lyrics',
        rating: 4,
        source: 'google' },
    { title: 'React',
        cleanTitle: 'REACT',
        author: 'Onyx',
        cleanAuthor: 'ONYX',
        link: 'https://genius.com/Onyx-react-lyrics',
        rating: 3,
        source: 'google' },
    { title: 'Chemicals React',
        cleanTitle: 'CHEMICALSREACT',
        author: 'Aly & AJ',
        cleanAuthor: 'ALYAJ',
        link: 'https://genius.com/Aly-and-aj-chemicals-react-lyrics',
        rating: 2,
        source: 'google' },
    { title: 'React',
        cleanTitle: 'REACT',
        author: 'Jaylib',
        cleanAuthor: 'JAYLIB',
        link: 'https://genius.com/Jaylib-react-lyrics',
        rating: 1,
        source: 'google' } ];



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
//
// mergeSources(x, y);
// let u = [{"title":"React","cleanTitle":"REACT","author":"Erick Sermon","cleanAuthor":"ERICKSERMON","link":"https://genius.com/Erick-sermon-react-lyrics","rating":5,"source":"google"},{"title":"Respond/React","cleanTitle":"RESPONDREACT","author":"The Roots","cleanAuthor":"THEROOTS","link":"https://genius.com/The-roots-respond-react-lyrics","rating":4,"source":"google"},{"title":"React","cleanTitle":"REACT","author":"Onyx","cleanAuthor":"ONYX","link":"https://genius.com/Onyx-react-lyrics","rating":3,"source":"google"},{"title":"Chemicals React","cleanTitle":"CHEMICALSREACT","author":"Aly & AJ","cleanAuthor":"ALYAJ","link":"https://genius.com/Aly-and-aj-chemicals-react-lyrics","rating":2,"source":"google"},{"title":"React","cleanTitle":"REACT","author":"Jaylib","cleanAuthor":"JAYLIB","link":"https://genius.com/Jaylib-react-lyrics","rating":1,"source":"google"}];
// console.log(u);
