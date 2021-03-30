const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req, res, next){
    res.json({data: dishes})
}

function dishValidator(req, res, next){
    const fieldList = ["name", "description", "price", "image_url"]
    //console.log("This is the string-------",req.body)
    for (const field of fieldList){
        //console.log(field)
        if(!req.body.data[field]){
            next({
                status: 400,
                message: `Required field: "${field}"`
            })
        }
    }

    if(req.body.data.price < 0){
        next({
            status: 400,
            message: "price is below zero"
        })
    }
    if(typeof req.body.data.price !== "number"){
        next({
            status: 400,
            message: "price must be a number"
        })
    }
    next();
}

function create(req, res, next){
   const { data: {name, description, price, image_url}} = req.body;
    const newItem = {
        id: nextId(),
        name, 
        description,
        price, 
        image_url
    }
    dishes.push(newItem);
    res.status(201).json({data: newItem})
}

function itemExists(req, res, next){
    const {dishId} = req.params;
    const foundItem = dishes.find((dish) => dish.id === dishId);
    if(foundItem){
        res.locals.item = foundItem;
        return next();
    }
    next({
        status: 404,
        message: `dish id not found ${dishId}`
    })
}

function read(req, res, next){
    const foundItem = res.locals.item;
    res.json({data: foundItem});
}

function update(req, res, next){
    const foundItem = res.locals.item;
    const { data: {name, description, price, image_url}} = req.body;
    const {dishId} = req.params;
    const idChecker = req.body.data.id;
    //console.log(req.params)
    if(dishId !== idChecker && idChecker){
        return next({
            status: 400,
            message: `id ${dishId} does not match ${req.body.data.id}`
        })
    }
    

    foundItem.name = name;
    foundItem.description = description;
    foundItem.price = price;
    foundItem.image_url = image_url;
    res.json({data: foundItem})
    



}

module.exports = {
    list,
    create: [dishValidator, create],
    read: [itemExists, read],
    update: [itemExists, dishValidator, update],
    //create: [dishValidator, create],
}
