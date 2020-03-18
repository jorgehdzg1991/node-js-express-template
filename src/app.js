import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import PostsController from './controllers/PostsController';
import FilesController from './controllers/FilesController';

const app = express();
app.use(cors());
app.use(bodyParser.json());

PostsController.mount(app);
FilesController.mount(app);

export default app;
