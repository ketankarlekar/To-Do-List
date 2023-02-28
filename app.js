const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.set("strictQuery", true);

const app = express();

// const items = [];
// const workitems = [];
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to do list !! ",
});
const item2 = new Item({
  name: "Hit the + button to add up new item ",
});
const item3 = new Item({
  name: "<-- Hit this to delete Item ",
});
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("List", listSchema);

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//  app.get("/", (req, res) => {
//    res.render("list", { listTitle: "Today", newListItems: items.reverse() });

//    console.log(items);
//  });

app.get("/", (req, res) => {
  Item.find({}, (err, foundItems) => {
    if (err) {
      console.log(err);
    } else {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, { ordered: false }, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("successfully saved default items to DB.");
          }
          res.redirect("/");
        });
        res.redirect("/");
      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: foundItems,
        });
      }
    }
  });
});

app.get("/:customListName", (req, res) => {
   const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, (err, foundLists) => {
    if (!err) {
      // create new list
      if (!foundLists) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // show and existing list
        res.render("list", {
          listTitle: foundLists.name,
          newListItems: foundLists.items,
        });
      }
    }
  });
});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, foundLists) => {
      foundLists.items.push(item);
      foundLists.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(req.body.checkbox, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully deleted item from DB.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      (err, foundLists) => {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

//   if (req.body.list === "work") {
//     workitems.push(item);
//     res.redirect("/work");
//   } else {
//     items.push(item);

//     res.redirect("/");
//   }
// });

// app.get("/work", (req, res) => {
//   res.render("list", { listTitle: "work list", newListItems: workitems });
// });

// app.post("/work", (req, res) => {
//   const item = req.body.newItem;
//   workitems.push(item);
//   res.redirect("/work");
// });

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(3090, () => {
  console.log("Server started  on port 3090");
});
