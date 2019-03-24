let googleApi = require('./lib/googleApi');
let geniusApi = require('./lib/geniusScrape');

async function test() {
    let custom = await googleApi.customSearch('react');
    console.log(custom);
    let scrape = await geniusApi.geniusSearch('react');
    console.log(scrape);
}
test();