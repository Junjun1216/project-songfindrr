# Song Findrr
---
## Team
- Junchao Chen
- Kasra Rahmani
- Daniel Chen
---

## What Is Song Findrr?
Song Findrr is a search engine where the user can either type or verbally input the line of a lyric of a song and the search engine will find all relevant song titles with that lyric

**Basic example:**

```sh
$ Input: "Out like a light"
Travis Scott - Sicko Mode
Ciara - Ride
The Honeysticks - Out Like a Light
DIIV - Out of Mind
Aaron Watson - Kiss That Girl Goodbye
...
```
---
## Key Features to Finish in Beta
- Frontend UI along with most UI elements we might use (or thought of using at the time)
- Other platforms not supported yet
- Voice to text implemented
- Backend Simple Webcrawling/capturing data to database  (assuming the user inputs a proper input every time)
- A Simple query of captured data (display most queried elements or if too many elements display 10-15 without any kind of relevance sorting techniques)
- Most of the backend functions at this stage is a proof of concept without any refinement
---

## Key Features for Final Application
- Complex Webcrawling/capturing data to database (queries user input to identify potential irrelevant/vague inputs)
- Complex query of captured data (sort displayed results by relevance, date created, author etc, throwing warnings for large databases due to invalid/vague inputs)
- Playable links will be provided for the top 3-5 returned results
- When the user has chosen the song that they are looking for, they will be given the option to listen to the song
- The user is able to query for a number of results
- Supports mobile and desktop platforms, compatible with other browsers
- Error Handling (like the type mentioned above)
- Security
---

## Technology to be Used
- Angular Framework
- Node.JS
- Creating a specific webcrawler from ground up
- ElasticSearch database
---

## Technical Challenges
- Learning/creating how Webcrawling works and how we will use it
- Learning angular framework
- Querying captured data (which results to display, order to display it in,  etc.)
- Although it is given. Creating an appealing and intuitive UI for a very straight forward app can be challenging
- Learning ElasticSearch
- How to utilize Google's search API

