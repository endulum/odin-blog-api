import router from "./router/router";

import express from "express";
import morgan from "morgan";
import cors from 'cors';
import 'dotenv/config';
import mongoose from "mongoose";
// import jsonwebtoken from "jsonwebtoken";

mongoose.set('strictQuery', false);
const mongoDB = process.env.MONGO;
main().catch(e => console.log(e));
async function main() { await mongoose.connect(mongoDB) }

const app = express();

app.use(cors());

app.use(morgan('dev'));

app.get('/', (req, res) => {
  return res.send('Received a GET HTTP method');
});

app.post('/', (req, res) => {
  return res.send('Received a POST HTTP method');
});

app.put('/', (req, res) => {
  return res.send('Received a PUT HTTP method');
});

app.delete('/', (req, res) => {
  return res.send('Received a DELETE HTTP method');
});

app.use('/', router);

app.listen(3000, () =>
  console.log('app listening on port 3000'),
);