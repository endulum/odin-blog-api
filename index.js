import apiRouter from "./routers/apiRouter";

import express from "express";
import morgan from "morgan";
import cors from 'cors';
import 'dotenv/config';
import mongoose from "mongoose";

mongoose.set('strictQuery', false);
const mongoDB = process.env.MONGO;
main().catch(e => console.log(e));
async function main() { await mongoose.connect(mongoDB) }

const app = express();

app.use(cors());

app.use(morgan('dev'));

app.use(express.json());

app.use('/api', apiRouter);

app.listen(3000, () =>
  console.log('app listening on port 3000'),
);