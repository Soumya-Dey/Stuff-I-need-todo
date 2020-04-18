require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();
const port = process.env.PORT || 3000;

// MIDDLEWARES
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("static"));

// DATABASE SETUP
mongoose.connect(
    process.env.MONGO_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    },
    (err) => {
        if(err) console.log(err);
        else console.log('Database connected')
    }
);

// schema for storing a single item
const itemSchema = mongoose.Schema({
    item: String,
});

const Item = mongoose.model("item", itemSchema);

// schema for storing a list of items
const listSchema = mongoose.Schema({
    name: String,
    items: [itemSchema],
});

const List = mongoose.model("list", listSchema);

// default items to start with
const defaultItems = [
    Item({
        item: "Hit the + icon to add more items",
    }),
    Item({
        item: "click the checkbox to delete a item",
    }),
];

// GET ROUTES
app.get("/", (req, res) => {
    // finding all items in DB. returns an array of found items
    Item.find({}, (err, results) => {
        if (err) console.log(err);
        else {
            // only inserting the default items when the collection is empty
            // i.e inserting the default items only once
            if (results.length === 0) {
                Item.insertMany(defaultItems, (err) => {
                    if (err) console.log(err);
                    else res.redirect("/");
                });
            } else {
                List.find({}, (err, allLists) => {
                    if (err) console.log(err);
                    else {
                        res.render("list", {
                            dayOfWeek: date.getDate(),
                            listName: "Default",
                            items: results,
                            allLists: allLists,
                        });
                    }
                });
            }
        }
    });
});

app.get("/:customList", (req, res) => {
    const customListName = req.params.customList.toLowerCase();

    // finding if a list with same name already exists in DB.
    // returns only the list item if found.
    List.findOne({ name: customListName }, (err, result) => {
        if (err) console.log(err);
        else {
            if (result) {
                List.find({}, (err, allLists) => {
                    if (err) console.log(err);
                    else {
                        res.render("list", {
                            dayOfWeek: date.getDate(),
                            listName: result.name,
                            items: result.items,
                            allLists: allLists,
                        });
                    }
                });
            } else {
                const newList = List({
                    name: customListName,
                    items: defaultItems,
                });

                newList.save();

                res.redirect(`/${customListName}`);
            }
        }
    });
});

// POST ROUTES
app.post("/", (req, res) => {
    const newItem = Item({
        item: req.body.newItem,
    });

    if (req.body.list === "Default") {
        newItem.save();
        res.redirect("/");
    } else {
        List.findOne({ name: req.body.list }, (err, result) => {
            if (err) console.log(err);
            else {
                result.items.push(newItem);
                result.save();
            }

            res.redirect(`/${req.body.list}`);
        });
    }
});

app.post("/new-list", (req, res) => {
    const newListName = req.body.newList.toLowerCase();

    res.redirect(`/${newListName}`);
});

app.post("/delete", (req, res) => {
    if (req.body.listName === "Default") {
        Item.findByIdAndRemove(req.body.checkbox, (err) => {
            if (err) console.log(err);
            else res.redirect("/");
        });
    } else {
        // USING ONLY JS ARRAY METHODS TO DELETE THE ITEM FROM ARRAY
        /*
        List.findOne({ name: req.body.listName }, (err, result) => {
            if (err) console.log(err);
            else {
                const indexToRemove = result.items.findIndex(
                    (item) => item._id === req.body.checkbox
                );

                // splice() changes the contents of an array 
                // by removing or replacing existing elements 
                // and/or adding new elements in place.
                // KNOW MORE: https://rb.gy/tqjvaz
                result.items.splice(indexToRemove, 1);
                result.save();

                res.redirect(`/${req.body.listName}`);
            }
        });
        */

        // USING MONGODB SPECIFIC METHODS TO DELETE THE ITEM FROM ARRAY
        // KNOW MORE: https://rb.gy/5wmwf9
        List.findOneAndUpdate(
            { name: req.body.listName },
            { $pull: { items: { _id: req.body.checkbox } } },
            (err, result) => {
                if (err) console.log(err);
                else res.redirect(`/${req.body.listName}`);
            }
        );
    }
});

app.post("/delete-list", (req, res) => {
    List.findOneAndRemove({ name: req.body.deleteBtn }, (err) => {
        if (err) console.log(err);
        else res.redirect("/");
    });
});

app.listen(port, () => console.log("server started at " + port));
