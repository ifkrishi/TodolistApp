//jshint esversion:6
const mongoose = require('mongoose');
const express = require("express");
const bodyParser = require("body-parser");
const _ = require('lodash');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//MongoDB CONNECTING
mongoose.connect('mongodb+srv://ifkrishi:Krishiagrawal2002@mongodbyoutube.2hncw3u.mongodb.net/todolistDB').then(() => console.log('Connected!'));

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
}});
const Item = mongoose.model("item", itemSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});
const List = mongoose.model("list", listSchema);

const item1 = new Item({
  name: "Eat"
})
const item2 = new Item({
  name: "Sleep"
})
const item3 = new Item({
  name: "Repeat"
})
const defaultItems = [item1, item2, item3];
// const workItems = [];

// HTTP REQUESTS
app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems){
    if(foundItems.length == 0){
      Item.insertMany(defaultItems);
      res.redirect('/');
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
  
});

app.get("/:customListName",function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        console.log(customListName);
        res.redirect(`/${customListName}`);
      }
      else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  })
  if(listName === "Today"){
    item.save();
    res.redirect('/');
  }
  else{
    List.findOne({name : listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName);
    })
  }
});

app.post('/delete',async (req, res) => {
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    await Item.deleteOne({_id: checkedItemID});
    res.redirect('/');
  }
  else{
    await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id : checkedItemID}}});
    res.redirect("/" + listName);
  }

});

app.listen(3001, function() {
  console.log("Server started on port 3000");
});
