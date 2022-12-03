const express = require('express');
const app = express();


const PORT = 8080;

app.get('/', (req, res, next) => {
    res.send("Hello Atif!")
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});