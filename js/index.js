const searchField = document.querySelector('.search-bar input')
const searchButton = document.querySelector('form')
const movieResults = document.querySelector('.results')
const moreResults = document.getElementById('more-results')
let currentSearch = ''
let pageNumber = 1

//Step 1 /* Setup local storage to save movies if there isn't a key pair setup yet */
if(!localStorage.getItem('Watchlist')) {
    localStorage.setItem('Watchlist', JSON.stringify([])) //Create a key and an empty array
}


function omdbSearch(searchText, pageNumber) { //Step 3 - Use the API to perform a general search
    fetch(`https://www.omdbapi.com/?apikey=90353081&s=${searchText}&page=${pageNumber}`)
    .then( response => response.json() )
    .then( data => {
        if(data.Search) {
            omdbTitleSearch(data) //With the resulting data call function to search with titles
        }else {
            if(moreResults.classList.contains('hidden')) {
                movieResults.innerHTML = `
                    <section class="movie-not-found">
                        <h2>Unable to find ${currentSearch}</h2>
                        <p>Please check for any typos.</p>
                    </section>
                `    
            } else {
                moreResults.innerText = 'No Results Left'
                moreResults.disabled = true    
            }
        }
    })
    .catch(error => console.log(error))
}

function omdbTitleSearch(searchData) { //Step 4 - Do another search but with titles to get more data properties
    let searchResults
    let movieSearchTitles = []
    searchResults = searchData.Search //To access Array of search results
    searchResults.forEach( function(movies) { //Make an array with movie titles from the first search
        movieSearchTitles.push(movies.Title)
    })
    
    let groupOfMovies = []
    movieSearchTitles.forEach( movieData => { //Step 5 - Search using the array of movie titles
        fetch(`https://www.omdbapi.com/?apikey=90353081&t=${movieData}`)
        .then( response => response.json() )
        .then( data => {
            groupOfMovies.push(data) //Creat an array of the results
            buildResults(data)
        })
    })


    function buildResults(data) { // Step 6 - Make HTML from search with titles but exclude bad results
        Object.assign(this, data)
        const {Ratings, Poster, Title, Runtime, Genre, Plot} = this;
        const imdbRating = Ratings.length > 0 ? Ratings[0].Value.slice(0,3) : 'N/A'; //Filter out errors when there's no ratings
        if(data.Response !== 'False') {
            movieResults.innerHTML += `
                <section class="movie">
                    <div class="poster">
                        <img src="${Poster}" alt="movie-poster">
                    </div>
                    <div class="movie-info">
                        <h2>${Title} <span class="rating-score">⭐️ ${imdbRating}</span></h2>
                        <div class="movie-details">
                            <p>${Runtime}</p>
                            <p>${Genre}</p>
                            <button class="watch-list-btn add-btn-light" data-title="${Title}">Watchlist</button>
                        </div>
                        <div class="plot">
                            <p class="expand-text">${Plot}</p>
                            <button class="read-more">Read More</button>
                        </div>    
                    </div>
                </section>
            `;
            /* Expand or constrain plot text */
            const expandText = document.querySelectorAll('.read-more')
            expandText.forEach( (plot) => {
                plot.addEventListener('click', (e) => {
                    let clicked = e.target.previousElementSibling;
                    if(clicked.classList.contains('expand-text')) {
                        clicked.classList.toggle('expand-text')
                        e.target.innerText = "Read Less"
                    }else if(!clicked.classList.contains('expand-text')) {
                        clicked.classList.toggle('expand-text')
                        e.target.innerText = "Read More"
                    }
                })
            })
        }

        /* Add or Remove Movies to Watchlist(localStorage) directly from Search results */
        const addToWatchList = document.querySelectorAll('.watch-list-btn'); //Select all Watchlist buttons from results
        addToWatchList.forEach( (wlBtn) => {
            let currentStorage = localStorage.getItem('Watchlist'); //Save what's currently in localstorage to a variable
            let storedMovies = JSON.parse(currentStorage); //Parse previous variable
            let verifyMovie = storedMovies.indexOf(wlBtn.dataset.title); //Is the movie from the search results part of localstorage
            if(verifyMovie > -1) { // If the movie is already in localstorage change the button bkg + to a -
                wlBtn.classList.remove('add-btn-light');
                wlBtn.classList.add('remove-btn-light');    
            }

            wlBtn.addEventListener('click', (e) => { //Listen to all Watchlist buttons
                let addMovie = e.target.dataset.title; //Assign movie title related to button
                if(!localStorage.getItem('Watchlist')) { //If the key isn't in localStorage
                    localStorage.setItem('Watchlist', JSON.stringify([addMovie])) //Make it and add the movie clicked
                    e.target.classList.remove('add-btn-light');
                    e.target.classList.add('remove-btn-light');
                }else {
                    currentStorage = localStorage.getItem('Watchlist');
                    storedMovies = JSON.parse(currentStorage);
                    verifyMovie = storedMovies.indexOf(addMovie);
                    if(verifyMovie > -1) { // If the movie is already in localStorage then remove it
                      storedMovies.splice(verifyMovie, 1)
                      localStorage.setItem('Watchlist', JSON.stringify(storedMovies))
                      e.target.classList.remove('remove-btn-light');
                      e.target.classList.add('add-btn-light');    
                    } else { // If not then add it to localStorage
                        storedMovies.push(addMovie)
                        localStorage.setItem('Watchlist', JSON.stringify(storedMovies))
                        e.target.classList.remove('add-btn-light');
                        e.target.classList.add('remove-btn-light');    
                    }
                }
            })
        })
        
        if(moreResults.classList.contains('hidden')) { //enable More Results Btn when search is performed
            moreResults.classList.toggle('hidden')
        }
    }
}

/*** Event Listeners ***/

//Step - Optional (More Results)
moreResults.addEventListener('click', () => {//Provide more results through button
        pageNumber++
        omdbSearch(currentSearch, pageNumber)
})

//Step 2 - Search Submission
searchButton.addEventListener('submit', (e) => {
    e.preventDefault()
    moreResults.classList.contains("hidden") ? null : moreResults.classList.add("hidden")//hide the More Results Btn when starting new searches
    moreResults.innerText = 'More Results' //Reset text for More Results Btn
    moreResults.disabled = false //Re-enable button if pervious search reached the end
    pageNumber = 1 //Page needs to be 1 for new searches
    movieSearchTitles = [] //Erase previous search queries titles
    currentSearch = searchField.value //Saved search text to use with "More Results Btn"
    omdbSearch(searchField.value, pageNumber) //Perform a search using the API 
    searchField.value = null //Clear search field
    movieResults.innerHTML = '' //Clear HTML from Previous Results
})
