const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const { graphqlHTTP } = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');


const MONGODB_URI = 'mongodb+srv://moohdy:moohdy9ted%3F@cluster0.npd8x.mongodb.net/blog?retryWrites=true&w=majority';

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images');
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname + '-' + new Date().toISOString().replace(/:/g, '-')); //the replace path is for windows os
    }
});
  
const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/PNG' || file.mimetype === 'image/png'){
      cb(null, true);
    }else{
      cb(null, false);
    }
}
  

app.use(bodyParser.json());
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if(req.method === 'OPTIONS'){
    return res.sendStatus(200);
  }

  next();
  
});

app.use('/graph', graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true,
  formatError(err){
    if(!err.originalError){
      return err;
    }

    const data = err.originalError.data;
    const message = err.message || 'An Error Occured';
    const code = err.originalError.code || 500;
    return {
      message, status: code, data: data
    }
  }
}));

app.use((error, req, res, next) => { //universal error handler triggered by next(err) in an asynchronous code and throw err in a synchronous code
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message: message, data: data})
})

mongoose.connect(MONGODB_URI).then(result => {
    app.listen(3002);
}).catch( err => {
    console.log(err);
});