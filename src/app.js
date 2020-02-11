import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import FilesController from './controllers/FilesController';

const app = express();
app.use(cors());
app.use(bodyParser.json());

FilesController.mountController(app);

export default app;
