const movieResults = document.querySelector('.results')

/* Setup page depending if a Watchlist key exists, array in paired to Watchlist is empty or show current Watchlist */
if(!localStorage.getItem('Watchlist')) {
    localStorage.setItem('Watchlist', JSON.stringify([])) //Create a key and an empty array
    document.querySelector('.watchlist-empty').classList.toggle('hidden')
    document.querySelector('main').classList.add('rfwl')
}else if (localStorage.Watchlist === '[]') {
    document.querySelector('.watchlist-empty').classList.toggle('hidden')
    document.querySelector('main').classList.add('rfwl')

}
else {
    document.querySelector('main').classList.toggle('rfwl')
    let currentStorage = localStorage.getItem('Watchlist'); // Save what's currently in localstorage to a variable
    let storedMovies = JSON.parse(currentStorage); // Parse previous variable
    omdbTitleSearch(storedMovies)
}

function omdbTitleSearch(searchData) { // Search with titles
    let groupOfMovies = []
    searchData.forEach( movieData => { // Search using the array of movie titles
        fetch(`https://www.omdbapi.com/?apikey=90353081&t=${movieData}`)
        .then( response => response.json() )
        .then( data => {
            groupOfMovies.push(data) // Creat an array of the results
            buildResults(data)
        })
    })

    function buildResults(data) { // Make HTML from search with titles but exclude bad results
        Object.assign(this, data)
        const {Ratings, Poster, Title, Runtime, Genre, Plot} = this;
        const imdbRating = Ratings.length > 0 ? Ratings[0].Value.slice(0,3) : 'N/A'; //Filter out errors when there's no ratings
        if(data.Response !== 'False') {
            movieResults.innerHTML += `
                <section class="movie show">
                    <div class="poster">
                        <img src="${Poster}" alt="movie-poster">
                    </div>
                    <div class="movie-info">
                        <h2>${Title} <span class="rating-score">⭐️${imdbRating}</span></h2>
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

        /* Add or Remove Movies to Watchlist(localStorage) directly from results */
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
                const addMovie = e.target.dataset.title; //Assign movie title related to button
                const papa = (((e.target.parentElement).parentElement).parentElement); //Select an entire movie section
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
                      const moviesRemaining = document.querySelectorAll('.movie');
                      if(moviesRemaining.length <= 1) {// If all movies have been removed from the watchlist
                        localStorage.removeItem('Watchlist')
                        document.querySelector('.watchlist-empty').classList.toggle('hidden')
                        document.querySelector('main').classList.add('rfwl')
                      }
                      papa.remove()
                    } 
                }
            })
        })
    }
}