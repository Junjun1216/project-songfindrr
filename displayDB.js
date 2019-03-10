const nedb = require('nedb');
const songLyrics = new nedb({ filename: 'db/song.db', autoload: true, timestampData: true});
songLyrics.find({}, function(err, songs) {
    console.log(songs);
    console.log(songs.length);
});