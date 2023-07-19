$(document).ready(() => {
    // Data collection through form submission
    $('#searchform').on('submit', (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        let srchText = $('#searchText').val().trim();
        $('form > input[type=reset]').trigger('click');
        $('#searchText').removeAttr('autofocus');
        sessionStorage.setItem('searchTerm', srchText);

        if ($('#ctrlSrch').is(':focus')) {
            getMoviesDirectly(srchText);
        } else if ($('#buttonDS').is(':focus')) {
            getMoviesThroughDS(srchText);
        }
    });
});
function backOff() {
    $(".overlay").html('');
    $(".overlay").css("visibility", "hidden");
    $(".modal").css("opacity","0");
}
function getMoviesDirectly(srchText) {
    axios.get('https://www.omdbapi.com/?apikey=af905a92&s='+srchText)
    .then((response) => {
        console.log(response);
        let movies = response.data.Search;
        let output = '';
        if(response.data.Response == "False") {
            $('#movies').html('');
            output = `
                <div class="modal">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Database Error</h5>
                            </div>
                            <div class="modal-body">
                                <p>MaMa Mia ! We can't find what you're searching for, Let's search for something else.</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" id="close-btn" class="btn btn-secondary" data-dismiss="modal" onclick="backOff()">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $(".overlay").html(output);
            $(".overlay").css("visibility", "visible");
            $(".modal").css("opacity", "1");
        } else {
            $.each(movies, (index, movie) => {
                output += `
                    <div class="card">
                        <section class="movie_image">
                            <img class="movie_poster" src="${movie.Poster}" onerror="this.src='./images/not-available.jpg'" alt="${movie.Title}" />
                        </section>
                        
                        <section class="center">
                            <div class="about_movie">
                                <h5 class="movie-year">${movie.Year}</h5>
                                <h3 class="movie-title">${movie.Title}</h3>
                                <button class="watch" onclick="movieSelected('${movie.imdbID}')"> 
                                    <svg viewBox="0 0 30.051 30.051" style="enable-background:new 0 0 30.051 30.051;" xml:space="preserve">
                                        <path d="M19.982,14.438l-6.24-4.536c-0.229-0.166-0.533-0.191-0.784-0.062c-0.253,0.128-0.411,0.388-0.411,0.669v9.069
                                            c0,0.284,0.158,0.543,0.411,0.671c0.107,0.054,0.224,0.081,0.342,0.081c0.154,0,0.31-0.049,0.442-0.146l6.24-4.532
                                            c0.197-0.145,0.312-0.369,0.312-0.607C20.295,14.803,20.177,14.58,19.982,14.438z" />
                                        <path d="M15.026,0.002C6.726,0.002,0,6.728,0,15.028c0,8.297,6.726,15.021,15.026,15.021c8.298,0,15.025-6.725,15.025-15.021
                                            C30.052,6.728,23.324,0.002,15.026,0.002z M15.026,27.542c-6.912,0-12.516-5.601-12.516-12.514c0-6.91,5.604-12.518,12.516-12.518
                                            c6.911,0,12.514,5.607,12.514,12.518C27.541,21.941,21.937,27.542,15.026,27.542z" />
                                    </svg>Find out more
                                </button>
                            </div>
                        </section>
                    </div>
                `;
            });
            $('#movies').html(output);
            $('html, body').animate({
                scrollTop: $("#movies").offset().top
            }, 1000);
            $('.container-fluid').css("margin-bottom","25px");
            $('.container#adUnit').css("margin-top","0");
            $('.pagination').css("display", "block");
            $('.container#adUnit').css("margin-bottom","50px");
            
            sessionStorage.setItem("pageNumber", "1");
        }
    })
    .catch((err) => {
        let output = `
                <div class="modal">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Network Error</h5>
                            </div>
                            <div class="modal-body">
                                <p>Oh Noooo. Kindly Check your internet connection and try again by entering the search term.</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" id="close-btn" class="btn btn-secondary" data-dismiss="modal" onclick="backOff()">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $(".overlay").html(output);
            $(".overlay").css("visibility", "visible");
            $(".modal").css("opacity", "1");
    });
}
function getMoviesThroughDS(srchText) {
    console.log("inside getMovieThroughDS Function");
    
    fetch('/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ srchText }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.movieIds);
        getMoviesforDS(data.movieIds);
        // Handle the response data as needed
      })
      .catch((error) => {
        console.error('Error:', error);
      });
}
  function getMoviesforDS(moviesIDFromOpenAI) {
    // Fetch movie details from OMDB API for each IMDb ID
const movieDataPromises = moviesIDFromOpenAI.map((id) => {
    return axios
      .get(`https://www.omdbapi.com/?apikey=af905a92&s&i=${id}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error(`Error fetching movie data for IMDb ID ${id}:`, error);
        return { imdbID: id, error: error.message };
      });
  });
  
  // Wait for all the promises to resolve
  Promise.all(movieDataPromises)
    .then((movieData) => {
      console.log("Movie Data:", movieData);
  
      // Display the movie data on the client-side
      let output = "";
      movieData.forEach((movie) => {
        if (movie.Response === "False") {
          // Handle movie not found case
          output += `
            <div class="card">
              <section class="center">
                <h3 class="movie-title">Movie Not Found</h3>
                <p class="movie-year">IMDb ID: ${movie.imdbID}</p>
              </section>
            </div>
          `;
        } else {
          // Display movie details
          output += `
            <div class="card">
              <section class="movie_image">
                <img class="movie_poster" src="${movie.Poster}" onerror="this.src='./images/not-available.jpg'" alt="${movie.Title}" />
              </section>
              <section class="center">
                <div class="about_movie">
                  <h5 class="movie-year">${movie.Year}</h5>
                  <h3 class="movie-title">${movie.Title}</h3>
                  <button class="watch" onclick="movieSelected('${movie.imdbID}')">
                    <svg viewBox="0 0 30.051 30.051" style="enable-background:new 0 0 30.051 30.051;" xml:space="preserve">
                      <path d="M19.982,14.438l-6.24-4.536c-0.229-0.166-0.533-0.191-0.784-0.062c-0.253,0.128-0.411,0.388-0.411,0.669v9.069
                        c0,0.284,0.158,0.543,0.411,0.671c0.107,0.054,0.224,0.081,0.342,0.081c0.154,0,0.31-0.049,0.442-0.146l6.24-4.532
                        c0.197-0.145,0.312-0.369,0.312-0.607C20.295,14.803,20.177,14.58,19.982,14.438z" />
                      <path d="M15.026,0.002C6.726,0.002,0,6.728,0,15.028c0,8.297,6.726,15.021,15.026,15.021c8.298,0,15.025-6.725,15.025-15.021
                        C30.052,6.728,23.324,0.002,15.026,0.002z M15.026,27.542c-6.912,0-12.516-5.601-12.516-12.514c0-6.91,5.604-12.518,12.516-12.518
                        c6.911,0,12.514,5.607,12.514,12.518C27.541,21.941,21.937,27.542,15.026,27.542z" />
                    </svg>Find out more
                  </button>
                </div>
              </section>
            </div>
          `;
        }
      });
  
      // Display the movie data on the client-side
      $('#movies').html(output);
      $('html, body').animate({
        scrollTop: $("#movies").offset().top
      }, 1000);
      // ...
    })
    .catch((error) => {
      console.error('Error fetching movie data:', error);
      displayErrorModal('Network Error', 'Oh Noooo. Kindly check your internet connection and try again by entering the search term.');
    });
  

   
}
function movieSelected(id) {
    sessionStorage.setItem('movieID', id);
    window.location = "info.html";
    $("#info-modal").css("visibility", "visible");
    return false;
}
function getMovie() {
    let movieId = sessionStorage.getItem('movieID');

    axios.get('https://www.omdbapi.com/?apikey=af905a92&i='+movieId)
    .then((response) => {
        let movie = response.data;
        let output = `
            
        `;
    }).catch((err) => {
        console.error("Urrrggghhhhh!!!", err);
    });
}