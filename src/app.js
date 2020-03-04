import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import PostsController from './controllers/PostsController';

const app = express();
app.use(cors());
app.use(bodyParser.json());

PostsController.mount(app);

export default app;
