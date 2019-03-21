const nedb = require('nedb');
const songLyrics = new nedb({ filename: 'db/song.db', autoload: true, timestampData: true});
const azlinks = new nedb({ filename: 'db/azlinks.db', autoload: true, timestampData: true});
const azlinksback = new nedb({ filename: 'db/azlinksback.db', autoload: true, timestampData: true});

songLyrics.find({}, function(err, songs) {
    console.log(songs);
    console.log(songs.length);
});

azlinks.find({alpha: 'a'}, function(err, links) {
    console.log(links.length);
});

azlinksback.find({alpha: 'a'}, function(err, links) {
    console.log(links.length);
});