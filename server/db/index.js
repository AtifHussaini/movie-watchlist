const Sequelize = require('sequelize')
const postgresURL = "postgres://localhost:5432/moviewatchlist"
const db = new Sequelize(postgresURL)

const Movie = db.define("movie", {
    title: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    imdbLink: {
        type: Sequelize.STRING(1000),
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    watched: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
})

const Genre = db.define("genre", {
    name: {
        type: Sequelize.STRING(50),
        allowNull: false
    }
})
   
Movie.belongsToMany(Genre, { through: "movies_genres"})
Genre.belongsToMany(Movie, { through: "movies_genres"})

module.exports = {
    db,
    Movie,
    Genre
}

// const test = async () => {
//     try {
//         await db.authenticate();
//         console.log("connected to db")
//     } catch (err) {
//         console.log("YOU FUCKED UP:", err);
//     }
// }

// test();