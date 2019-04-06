# Songfindrr REST API Documentation

## Songfindrr API

### Create

- description: crossSource search given a query and returns a list of songs, and starts a background scrape for lyrics
- request: `POST /api/crossSearch/`
    - content-type: `application/json`
    - body: (object)
      - query: the song lyrics desired to be searched
- response: 200
    - content-type: `application/json`
    - body: (list) list containing Song Objects
        Song Objects
        - title: (string) (display title of song)
        - cleanTitle:(string) (standard formatted title of song for compare, check source rejex)
        - author: (string) (display author of song)
        - cleanAuthor: (string) (standard formatted author of song for compare, check source rejex)
        - link: (string) (link of song to scrape for lyrics)
        - rating: (int) (the matched rating of the song)
        - source: (string) (source of obtained song)
- response: 404
    - body: (string) No results found

``` 
// curl -X POST -H "Content-Type: application/json" -d '{"query":"react"}' http://localhost:3001/api/crossSearch/
```

### READ
- description: get song lyrics from elastic given its cleanAuthors and cleanTitles
- request: `/api/fetchLyrics/`
    - content-type: `application/json`
    - query: (object)
        cleanTitle
        - cleanTitle: (string) the title of the song stripped of symbols, uppercase and no space
        - cleanAuthor: (string) the author of the song stripped of symbols, uppercase and no space
- response: 200
    - content-type: `application/json`
    - body: (string) lyrics of song
- response: 404
    - body: 'No Song Found With Query: ' + cleanTitle + '-' + cleanAuthor
``` 
// curl -X GET 'http://localhost:3001/api/fetchLyrics/?cleanAuthor=DRAKE&cleanTitle=THELANGUAGE'
```
  