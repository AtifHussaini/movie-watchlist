const express = require('express')
const router = express.Router()
const { Genre, Movie } = require('../db');
const { all } = require('./genre');

// GET /movies
router.get('/', async (req, res, next) => {
    const onlyUnwatched = req.query.unwatched === "1";
    const genreName = req.query.genre;
    const whereClause = {}

    if (onlyUnwatched === true) {
        whereClause.watched = false;
    }

    try {

        let movies;
        if (genreName) {

            const specificGenre = await Genre.findOne({
                where: {
                    name: genreName
                }
            });

            if (!specificGenre) {
                res.status(404).send("Unknown genre");
                return;
            }

            movies = await specificGenre.getMovies({
                include: [Genre],
                order: [
                    ["title", "ASC"]
                ],
                where: whereClause
            });

        } else {
            movies = await Movie.findAll( {
                include: [Genre],
                order: [
                    ["title", "ASC"]
                ],
                where: whereClause
            });
        }
        
        res.send(`
            <!DOCTYPE html>
            <html>
                <head><title>Movie List</title></head>
                <link rel="stylesheet" type="text/css" href="/base-styling.css">
                <link rel="stylesheet" type="text/css" href="/movie-list-style.css">
                <body>
                    <h1>Movie List</h1>
                    <nav>
                        <a href="/movies/?unwatched=1">Only Unwatched Movies</a>
                        <a href="/movies/feeling-lucky">I'm Feeling Lucky</a>
                        <a href="/movies/add-movie">Add to Watchlist</a>
                    </nav>
                    <ul id="list-of-movies">
                        ${movies.map(movie => {
                            return `
                            <li class="${movie.watched === true ? "watched" : ""}">
                            <h2>${movie.title} ${movie.imdbLink ? `<a target="_blank"href="${movie.imdbLink}">IMDB</a>` : ""} </h2>
                            <ul class="genres-list">
                                ${movie.genres.map(genre => {
                                    return `<li><a href="/movies?genre=${genre.name}">${genre.name}</a></li>`
                                }).join("")}
                            </ul>
                            ${movie.watched === false ? `<a class="watch-link" href="/movies/${movie.id}/mark-watched">I watched this</a>` : ""}
                            </li>`
                        }).join("")}
                    </ul>
                </body>
            </html>
        `)
    } catch(err) {
        next(err)
    }
});

// GET /movies/feeling-lucky
router.get('/feeling-lucky', async (req, res, next) => {

    try {
        const allUnwatchedMovies = await Movie.findAll({
            where: {
                watched: false
            }
        });

        const amountOfUnwatchedMovies = allUnwatchedMovies.length;
        const randomNumber = Math.floor(Math.random() * amountOfUnwatchedMovies); 
        const chosenMovie = allUnwatchedMovies[randomNumber]

        res.send(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Your Chosen Movie</title>
                    <link rel="stylesheet" type="text/css" href="/base-styling.css">
                </head>
                <body>
                   <h1>Yo should watch: ${chosenMovie.title}</h1>
                   <a href="/movies">Back to list</a>
                   <a href="/movies/feeling-lucky">Try again</a>
                </body>
            </html>
        `)
    } catch(err) {
        next(err)
    }
});
// GET /movies/add-movie
// respond with HTML text to be rendered by the browser
// show a form
router.get('/add-movie', async (req, res) => {
    // res.sendFile(__dirname + "/views/movie-form.html");
    const allOfMyGenres = await Genre.findAll();

    res.send(`<!DOCTYPE html>
    <html lang="en">
    <head>
        <title>Add a movie to your watchlist</title>
        <link rel="stylesheet" type="text/css" href="/base-styling.css">
    </head>
    <body>
        <h1>Add Movie</h1>
        <form method="POST" action="/movies">
            <div>
                <label>Title:</label>
                <input type="text" name="title" />
            </div>
            <div>
                <label>IMDB Link:</label>
                <input type="text" name="link" placeholder="Optional" />
            </div>
            <div>
                <div id="genre-selects-container">
                    <select id="genre-select" name="genres">
                        <option></option>
                        ${
                            allOfMyGenres.map(genre => {
                                return `<option value="${genre.id}">${genre.name}</option>`
                            }).join("")
                        }
                    </select>
                </div>    
                <button type="button" id="add-button">+</button>
            </div>
            <button type="submit">Add Movie</button>
        </form>
        <script type="text/javascript" src="/movie-form.js"></script>
    </body>
    </html>`)
});

router.get('/:movieId/mark-watched', async (req, res, next) => {
    const id = req.params.movieId

    try {
        const theMovie = await Movie.findByPk(id);

        if(!theMovie) {
            res.status(404).send("No movie with that id");
            return;
        }

        theMovie.watched = true;
        await theMovie.save();

        res.redirect('/movies')
         
    } catch(err) {
        next(err)
    }
});

// POST /movies
router.post('/', async (req, res, next) => {

    const title = req.body.title;
    const imdbLink = req.body.link;
    const attachedGenreIds = req.body.genres;

    console.log(req.body)

    try {
        const newMovie = await Movie.create( {
            title: title,
            imdbLink: imdbLink || null
        });
        await newMovie.setGenres(attachedGenreIds);
        res.redirect('/movies')
    } catch(err) {
        next(err);
    }
});
 
module.exports = router;