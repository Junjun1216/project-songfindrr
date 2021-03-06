let elastic = module.exports = {};

// elasticsearch component
const elasticsearch = require('elasticsearch');
//let searchly_url = process.env.SEARCHBOX_SSL_URL;
let searchly_url = 'https://paas:1faa62e5e45cf5f90b0c8b97a4095d52@thorin-us-east-1.searchly.com';
const Client = new elasticsearch.Client({
    //host: 'localhost:9200'
    host: searchly_url || 'localhost:9200'
});

// ping the client
Client.ping({
    requestTimeout: 10000}, (err) => {
    if (err) {
        console.log('Bad Response From Elastic: ' + err);
    }
    else {
        console.log('Good Response From Elastic');
        console.log(searchly_url);
    }
});

/*  ******* Data types *******
    song objects must have at least the following attributes:
        - (String) title (display title of song)
        - (String) cleanTitle (standard formatted title of song for compare, check source rejex)
        - (String) author (display author of song)
        - (String) cleanAuthor (standard formatted author of song for compare, check source rejex)
        - (String) link (link of song to scrape for lyrics)
        - (string) source (source of obtained song)

****************************** */

/**
 * Checks the existence of a song in elastic database
 * @param {object} song object containing at least the cleanAuthor and cleanTitle attributes
 * @returns {Promise<boolean>} true if exists, false otherwise
 */
elastic.checkExistence = async (song) => {
    try {
        let result = await Client.search({
            index: 'songs',
            type: 'doc',
            body: {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "match": { cleanAuthor: song.cleanAuthor }
                            },
                            {
                                "match": { cleanTitle: song.cleanTitle }
                            }

                        ]
                    }
                }
            }
        });
        return (result.hits.hits.length !== 0);
    } catch {
        console.log('Failed To Confirm Existence: ' + song + ' ' + error);
        return false;
    }
};

/**
 * Checks the existence of a song in elastic database
 * @param {object} song object
 * @returns {Promise<boolean>} true if exists, false otherwise
 */
elastic.addSong = async (song) => {
    try {
        let result = await Client.search({
            index: 'songs',
            type: 'doc',
            body: {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "match": { cleanAuthor: song.cleanAuthor }
                            },
                            {
                                "match": { cleanTitle: song.cleanTitle }
                            }

                        ]
                    }
                }
            }
        });
        if (result.hits.hits.length === 0) {
            Client.index({
                index: "songs",
                type: 'doc',
                body: song
            }, (error, result) => {
                if (error) {
                    console.log('Song Not Added: ' + song.title + ' ' + error);
                    return false;
                } else {
                    console.log('New Song: ' + song.title);
                    return true;
                }
            });
        } else {
            console.log('Already Exists: ' + song.title);
            return true;
        }

    } catch {
        console.log('Failed To Check Existence: ' + song + ' ' + error);
        return false;
    }
};

/**
 * Get the lyrics of a song from the database
 * @param {string} cleanAuthor
 * @param {string} cleanTitle
 * @returns {Promise<string>} return lyrics if found, false otherwise
 */
elastic.getLyric = async (cleanAuthor, cleanTitle) => {
    try {
        let result = await Client.search({
            index: 'songs',
            type: 'doc',
            body: {
                "query": {
                    "bool": {
                        "must": [
                            {
                                "match": {cleanAuthor: cleanAuthor}
                            },
                            {
                                "match": {cleanTitle: cleanTitle}
                            }

                        ]
                    }
                }
            }
        });
        if (result.hits.hits.length === 0) {
            console.log('Song Not Found: ' + cleanTitle);
            return false;
        } else {
            console.log('Song Found: ' + cleanTitle);
            return result.hits.hits[0]._source.lyrics;
        }
    } catch (error) {
        console.log('Failed To Get Lyric: ' + cleanTitle + ' ' + error);
    }
};

/**
 * Perform ElasticSearch with query
 * @param {string} query is the lyrics wish to be searched
 * @returns {Promise<[objects]>} returns a list of song objects, [false] otherwise
 */
elastic.elasticSearch = async (query) => {
    console.log ('Searching Elastic For : ' + query);
    try {
        let result = await Client.search({
            index: 'songs',
            type: 'doc',
            body: /*{
             "query": {
                 "query_string": {
                     "default_field" : "lyrics",
                     "query" : req.body.lyric
                 }
             }
         }*/
                {
                    "query": {
                        "bool": {
                            "should": [{
                                "bool": {
                                    "must": [
                                        {
                                            "match_phrase": {"lyrics": query}
                                        }

                                    ],
                                    // boost the _score if whole phrase matches
                                    "boost": 3.0
                                }
                            }, {
                                "bool": {
                                    "must": [
                                        {
                                            "match": {"lyrics": query}
                                        }
                                    ]
                                }
                            }]
                        }
                    }

                }
        });
        let queriedData = [];
        for (let i in result.hits.hits) {
            if (i == 5) break;
            let credibility = 0;
            if (i >= 4 && result.hits.hits[i]._score < 2.5) credibility = 2;
            let query = {
                title: result.hits.hits[i]._source.title,
                author: result.hits.hits[i]._source.author,
                cleanTitle: result.hits.hits[i]._source.cleanTitle,
                cleanAuthor: result.hits.hits[i]._source.cleanAuthor,
                link: result.hits.hits[i]._source.link,
                rating: 5 - i - credibility,
                source: 'elastic'};
            queriedData.push(query);
        }
        if (queriedData.length === 0) queriedData[0] = false;
        return queriedData;
    } catch (error) {
        console.log('Elastic Search Failed: ' + query + ' ' + error)
        return [false];
    }
};

