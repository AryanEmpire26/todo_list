const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect('mongodb+srv://admin-aryan:%40aryanRanjan26@cluster0.sokrjsx.mongodb.net/todolistDB');

const itemSchema1 = new mongoose.Schema({
    name: String
});

const itemsSchema = mongoose.model('item', itemSchema1);

const defaultItems = [
    new itemsSchema({ name: 'Welcome to your todolist' }),
    new itemsSchema({ name: 'Hit the + button to add a new item.' }),
    new itemsSchema({ name: '<-- Hit this to delete an item.' })
];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema1]
});

const List = mongoose.model('List', listSchema);

// Rest of your code remains the same...


// below code is running multiple time whenever we run app.js and insert the items multiple times.

// itemsSchema.insertMany(defaultItems,function(err){ t
//     if (err) {
//         console.log(err);
//     } else {
//         console.log("success");
//     }
// });

app.get("/", function(req,res){
    
    itemsSchema.find({},function(err,foundItems){
        if (foundItems.length===0) { // if databse is empty then insert the below if something already present then dont run below code.

            itemsSchema.insertMany(defaultItems,function(err){
                // if (err) {
                //     // console.log(err);
                // } else {
                //     // console.log("success");
                // }
            });
            res.redirect("/"); //after first time insertion this code will redirect to home route and in second time code will not run if statement rather it will run else because db will have some date.
        } else {
        res.render("list", { kindofday: "Today", newItem: foundItems });
        }
      });
    });

app.post("/",function(req,res){
    const itemName=req.body.newItem;
    const listName = req.body.list;
    const item = new itemsSchema({
        name: itemName
    });
    if (listName === "Today") {
        item.save(function(err){
            if(err){
                // console.log(err);
            }
            else{
                
                res.redirect("/");
            }
        });
}
else{
    List.findOne({ name: listName }, function(err, foundList) {
        if (err) {
            // console.log(err);
        } 
        else {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        }
    });
}
});

app.get("/:customListName", function(req, res) {

    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList) {
      if (!err) {
        if (!foundList) {

         ////create a new list////
          const list = new List ({
              name: customListName,
              items: defaultItems
            })

            list.save();
            res.redirect("/" + customListName);
        } else {

        /////Show an existing list////       
        res.render("list", {kindofday: foundList.name, newItem: foundList.items});
        }

      }
    })
});





app.post("/delete",function(req,res){
    const checkedItemId=req.body.checkbox;
    const listName = req.body.listName;
    if (listName === "Today") {
    itemsSchema.findByIdAndRemove(checkedItemId,function(err){
        if (!err) {
            // console.log("Successfylly deleted checked item.");
            res.redirect("/");
        } 
    });
}else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
       if(!err) {
         res.redirect("/" + listName);
       }
    }) 
  }
});





app.listen(3000);