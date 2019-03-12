const path = require('path');
const jquery = require('jquery');
const Nightmare = require('nightmare');
const nightmare = Nightmare({show: true,
    webPreferences: {
        preload: path.resolve(__dirname, 'mypreload.js')
    }});

nightmare
    .goto('https://genius.com/search?q=react')
    .wait(2000)
    .scrollTo(1500, 0)
    .evaluate(() => {
        $('.full_width_button').eq(1).click();
    })
    .wait(3000)
    .evaluate(() => {
        let queriedData = {};
        $('.u-display_block').each(function (i,el) {
            const title = $(el).find('.mini_card-title').text().replace(/\n/g, '').replace(/ /g, '');
            const author = $(el).find('.mini_card-subtitle').text().replace(/\n/g, '').replace(/ /g, '');
            queriedData[author] = {author: author, title: title};
        });
        return queriedData;
    })
    .end()
    .then(function(body) {
        console.log(body);
    });