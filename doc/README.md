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
        - (string) title (display title of song)
        - (string) cleanTitle (standard formatted title of song for compare, check source rejex)
        - (string) author (display author of song)
        - (string) cleanAuthor (standard formatted author of song for compare, check source rejex)
        - (string) link (link of song to scrape for lyrics)
        - (int) rating (the matched rating of the song)
        - (string) source (source of obtained song)
- response: 204
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
        - (string) the title of the song stripped of symbols, uppercase and no space
        cleanAuthor
        - (string) the author of the song stripped of symbols, uppercase and no space
- response: 200
    - content-type: `application/json`
    - body: (string) lyrics of song
- response: 204
    - body: 'No Song Found With Query: ' + cleanTitle + '-' + cleanAuthor
``` 
// curl -X GET 'http://localhost:3001/api/fetchLyrics/?cleanAuthor=DRAKE&cleanTitle=THELANGUAGE'
```
  