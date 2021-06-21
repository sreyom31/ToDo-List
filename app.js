const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const date=require(__dirname+"/date.js");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});
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

app.get("/", function (req, res) {

    let day=date.getDate();

    Item.find({}, (err, foundItems)=>{

        if(foundItems.length===0){
            Item.insertMany(defaultItems, err=>{
                if(err) console.log(err);
                else console.log("Default items saved successfully to DB");
            })
            res.redirect("/");
        }

        else {
            res.render("list", { listTitle: day,newListItems:foundItems});
        }
    })
})

app.post("/",function(req,res){
    const item=req.body.newItem;
    if(req.body.list==="Work List"){
        workItems.push(item);
        res.redirect("/work");
    }
    else{
        items.push(item);
        res.redirect("/");
    }
})

app.get("/work",function(req,res){
    res.render("list",{listTitle:"Work List", newListItems:workItems})
})

app.post("/work",function(req,res){
    const item=req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
})

app.get("/about",function(req,res){
    res.render("about");
})

app.listen(80, function () {
    console.log("listening on port 80");
})

