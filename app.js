//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const app = express();
const _=require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://siddiquisaher773:saherVIT773@cluster0.rgxld1o.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//mongoose schema
const itemschema=new mongoose.Schema({     
name:String
});

//mongoose model requiring the above created schema
const item= mongoose.model("item", itemschema);    
const items = ["Buy Food", "Cook Food", "Eat Food"];

const item1=new item({
name:"Welcome to your Todolist!"
});

const item2=new item({
  name:"Hit the '+' button to add a new item"
});

const item3=new item({
  name:"<--Hit this to delete an item"
});

const defaultitems=[item1, item2, item3];

//schema 
const listschema=new mongoose.Schema({    
  name:String,
  items:[itemschema]
});


const list=mongoose.model("list",listschema);

app.get("/", function(req, res) {
const day = date.getDate();
item.find({},function(err,founditems){
  if(founditems.length===0){
    item.insertMany(defaultitems)
    .then(() => {
      console.log("Successfully stored items to db");
    })
    .catch((err) => {
      console.error(err);
  });
  //to not have repetetive items
  res.redirect("/");   
  }else
  res.render("list", {listTitle: "Today", newListItems: founditems});
});


//express route parameter
app.get("/:customListName",function(req, res){
  //make the case of the customlistname as first character capitalised
  const customListName=_.capitalize(req.params.customListName);
  list.findOne({name:customListName},function(err,foundlist){
    if(!err){
      if(!foundlist){
        //path to create new list
        const newlist=new list({
          name:customListName,
          items: defaultitems
        });
        newlist.save();
        res.redirect("/"+customListName);
      }
      else{
        //path to show existing list
        res.render("list",{listTitle: foundlist.name, newListItems: foundlist.items});
      }
    }
  })
});
});


app.post("/", function(req, res){
req.body.newItem;
  const itemname = req.body.newItem;
  //name of the button in list.ejs
  const listname=req.body.list;   

  const itemr=new item({
    name:itemname
  });

  if(listname=="Today"){
    itemr.save();
    //saves the new item and displays it on website by redirecting to home  
    res.redirect("/");    
   }
  else{
    list.findOne({name:listname},function(err,foundlist){
      foundlist.items.push(itemr);
      foundlist.save();
      res.redirect("/"+listname);
    });
  }
  });


app.post("/delete", function(req,res){
  //to remove the item with checked id
  const checkeditemid= req.body.checkbox;   
  const listname=req.body.listname;
  //checking to see if the deleted item is from custom list or home list
  //deleting from home page list
  if(listname==="Today"){
    item.findByIdAndRemove(checkeditemid, function(err){
      if(!err){
        console.log("successfully deleted!");
        res.redirect("/");  //redirect to home route for changes to show on website
      }
    });
  }
  //deleting from custom list
  else{
  //deleting from an array
  //pull item from item array having id same as checkeditemid
    list.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkeditemid}}},function(err,foundlist){
      if(!err){
        //redirect to the custom list path
        res.redirect("/"+listname);
      }
    })
  }
});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(5000, function() {
  console.log("Server started on port 5000");
});
