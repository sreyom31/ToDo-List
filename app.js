const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _ = require("lodash");
const date=require(__dirname+"/date.js");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

mongoose.connect("<mongodbPortConnect>/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema = {
    name: String
};

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
    name: "Welcome to your todo list!"
})

const item2 = new Item({
    name: "Hit the + button to add a new line."
})

const item3 = new Item({
    name: "<-- Hit this to delete an item."
})

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

    Item.find({}, (err, foundItems)=>{

        if(foundItems.length===0){
            Item.insertMany(defaultItems, err=>{
                if(err) console.log(err);
                else console.log("Default items saved successfully to DB");
            })
            res.redirect("/");
        }

        else {
            res.render("list", { listTitle: "Today",newListItems:foundItems});
        }
    })
})

app.post("/",function(req,res){
    const itemName = req.body.newItem;
    const listName = req.body.list
    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+ listName);
        })
    }

})

app.post("/delete", (req,res)=>{
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, err=>{
            if(!err) console.log("deleted the checked item successfully");
            res.redirect("/");
        })
    }
    else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            res.redirect("/"+ listName);
        });
    }

    
})

app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName},function(err, foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
            
                list.save();
                res.redirect("/" + customListName);
            }
            else{
                res.render("list", {listTitle: foundList.name, newListItems:foundList.items} )
            }
        }
    })
})

app.get("/about",function(req,res){
    res.render("about");
})

app.listen(process.env.PORT || 80, function () {
    console.log("Server has started successfully");
})

