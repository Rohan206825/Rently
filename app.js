const express = require('express');
const app = express();
const mongoose = require('mongoose');

main()
    .then(() => {
        console.log('connected to DB');
    })
    .catch((err) => {
        console.log(err);
    })

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wonderlust');
}

app.get('/', (req,res) => {
    res.send('route is working');
})

app.listen(8080, () => {
    console.log("listening on port : 8080");
})