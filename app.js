const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const Listing = require('./models/listing');

app.set(express.static(path.join(__dirname,'public')));

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

app.get('/listing', async (req,res) => {
    let sampleListing = new Listing({
        title: "umbrella villa",
        description: "2BHK",
        Image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjiR3aGKbe2Jr-si36rhxyHsggbwaczhiLwMYOywnQ0MpP_wAr1uoZzovY4eahQ_-NIgj9XrYSs6NQQcs5D4xZ9yB6ZljpG9wtTu18AbtvwEeJAkP2214MY4sVrIoDTPU2OiGjb7WeTv4xJsqX0oMvxiG1v_6xPWNVKLa8AAKlu9P19L-h1K4l58nX1/s1600/modern-single-floor-house.jpg",
        price: 20000,
        location: "Pune",
        country: "India"
    })

    await sampleListing.save();
    console.log(sampleListing);
    res.send("working");
})

app.listen(8080, () => {
    console.log("listening on port : 8080");
})