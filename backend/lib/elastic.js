let elastic = module.exports = {};

// elasticsearch component
const elasticsearch = require('elasticsearch');
const Client = new elasticsearch.Client({
    host: 'localhost:9200'
});

// ping the client
Client.ping({
    requestTimeout: 10000}, function(err) {
    if (err) {
        console.error('elasticsearch cluster is down!');
    }
    else {
        console.log('good response from elastic');
    }
});

elastic.addSong = async function(song) {
    Client.search({
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
    }, function(err, result){
        if (err || result.hits.hits.length == 0) {
            console.log('index does not exist');
            Client.index({
                index: "songs",
                type: 'doc',
                body: song
            }, function(err, result) {
                if (err) {
                    console.log(err);
                    return [false]
                }
                else {
                    console.log('new song ' + song.title);
                    return [true];
                }
            });
        }
        else {
            console.log('already exists');
            // console.log(result.hits.hits);
            return [true]
        }
    });
};

elastic.getLyric = async function(cleanAuthor, cleanTitle) {
    let result = await Client.search({
        index: 'songs',
        type: 'doc',
        body: {
            "query": {
                "bool": {
                    "must": [
                        {
                            "match": { cleanAuthor: cleanAuthor }
                        },
                        {
                            "match": { cleanTitle: cleanTitle }
                        }

                    ]
                }
            }
        }
    });
    return new Promise(function (resolve) {
        if (result.hits.hits.length === 0) {
            console.log('song not found: ' + cleanTitle);
            resolve(false);
        } else {
            console.log('song found: ' + cleanTitle);
            resolve(result.hits.hits[0]._source.lyrics);
        }
    });
};

elastic.elasticSearch = async function(query) {
    console.log ('Searching Elastic For : ' + query);
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
                 "query" : {
                     "bool": {
                         "should": [{
                             "bool" : {
                                 "must": [
                                     {
                                         "match_phrase": { "lyrics": query}
                                     }

                                 ],
                                 // boost the _score if whole phrase matches
                                 "boost" : 3.0
                             }
                         }, {
                             "bool" : {
                                 "must" : [
                                     {
                                         "match": {"lyrics" : query}
                                     }
                                 ]
                             }
                         }]
                     }
                 }

             }
     });
    return new Promise(function (resolve) {
         let queriedData = [];
         for (let i in result.hits.hits) {
             if (i == 5) break;
             let query = {
                 title: result.hits.hits[i]._source.title,
                 author: result.hits.hits[i]._source.author,
                 cleanTitle: result.hits.hits[i]._source.cleanTitle,
                 cleanAuthor: result.hits.hits[i]._source.cleanAuthor,
                 link: result.hits.hits[i]._source.link,
                 rating: 5 - i,
                 source: 'elastic'};
             queriedData.push(query);
         }
         if (queriedData.length === 0) queriedData[0] = false;
         resolve(queriedData);
        resolve([false]);
    });
};

