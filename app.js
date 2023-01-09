const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


mongoose.set({ strictQuery: false });
mongoose.connect("mongodb+srv://r-icks:testingrishabh@cluster0.w3nuzru.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true });

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const itemSchema = {
  name: String
}

const item = new mongoose.model("Item", itemSchema);

const item1 = new item({
  name: "Welcome to your To Do List"
});
const item2 = new item({
  name: "Hit + to add a new item"
});
const item3 = new item({
  name: "<-- Hit this to delete an item"
});


const listSchema = {
  listName: String,
  listItems: [itemSchema]
};

const list = mongoose.model("list", listSchema);

app.get("/", function (req, res) {
  item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      item.insertMany([item1, item2, item3]);
      res.redirect("/");
    }
    else {
      res.render("list", { listTitle: "To Do List", newListItems: foundItems });
    }
  });
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName= req.body.list;
  const newItem = new item({
    name: itemName
  });
  if(listName === "To Do List"){
    newItem.save();
    res.redirect("/");
  }
  else{
    list.findOne({listName:listName},function(err,listFound){
      if(!err){
        listFound.listItems.push(newItem);
        listFound.save();
        res.redirect("/"+listName);
      }
    })
  }
});

app.post("/delete", function (req, res) {
  const deleteID = req.body.checkbox;
  const listName=req.body.listName;
  if(listName=="To Do List"){
    item.deleteOne({ _id: deleteID }, function (err) {
      if (err) {
      }
      else {
      }
    });
    res.redirect("/");
  }
  else{
    list.findOneAndUpdate({listName: listName},
      {
        $pull:{listItems:{_id:deleteID}}
      }, function(err){
        if(!err){
          res.redirect("/"+listName);
        }
      })
  }
})


app.get("/:anyrandom", function (req, res) {
  const listName = _.capitalize(req.params.anyrandom);
  list.findOne({listName: listName }, function (err, listFound) {
    if (!err) {
      if (!listFound) {
        const listitem = new list({
          listName: listName,
          listItems: [item1, item2, item3]
        });
        listitem.save();
        res.redirect("/"+listName);
      }
      else {
        res.render("list", { listTitle: listName, newListItems: listFound.listItems })
      }
    }
  })
})

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});