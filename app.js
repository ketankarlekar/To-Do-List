const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
console.log(date);

const app = express();

const items = [];
const workitems = [];


app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
   
    const day = date.getDate();

    res.render("list", {listTitle: day, newListItems: items
    });

    console.log(items);
});


app.post("/", (req, res) => {
    const item = req.body.newItem;
   
    if (req.body.list === "work") {
        workitems.push(item);
        res.redirect("/work");
    }
    else {
         items.push(item);

         res.redirect("/");
    }
  
});

app.get("/work", (req, res) => {
    res.render("list", { listTitle: "work list", newListItems: workitems });

});

app.post("/work", (req, res) => {
    const item = req.body.newItem;
    workitems.push(item);
    res.redirect("/work");

})

app.get("/about", (req, res) => {
    res.render("about");
});


app.listen(3090, () => {
    console.log("Server started  on port 3090");
});