import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import mongoose from "mongoose";
import { Task } from './src/model/task';
import { Remark } from './src/model/remark';
import { History } from './src/model/history';
import { User } from './src/model/user';

import { router as todoRouter } from './src/routes/task.router';
import { router as userRouter } from './src/routes/user.router';
import { router as teamRouter } from './src/routes/team.router';

dotenv.config();

const app: Express = express();

// Swagger 配置 接口文档暂时没具体写 只是加个swagger使用
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'todolist',
      version: '1.0.0',
    },
  },
  apis: ['src/routes/*.ts'], // 指定包含路由的文件路径，支持通配符
};

const specs = swaggerJsdoc(options);

async function initDB() {
  [Task, Remark, History, User].forEach(async coll => {
    await coll.prepare();
  });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/static", express.static("static"));
app.use('/todo', todoRouter);
app.use('/user', userRouter);
app.use('/team', teamRouter);
// 配置 Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/', (req: Request, res: Response) => {
  res.send('hello world!!');
});

async function main() {
  const port = process.env.PORT;
  const db_host = process.env.DB_HOST;
  const db_port = process.env.DB_PORT;
  const db_name = process.env.DB_NAME;
  
  await mongoose.connect(`mongodb://${db_host}:${db_port}/${db_name}`);
  console.log('connected success');

  await initDB();

  app.listen(port, () => {
    console.log(`Server port is ... :${port}`);
  });

  // console.log => log4js TODO
  process.on('SIGINT', () => {
    // app.close?
    process.exit()
  })

  process.on('uncaughtException', (err) => {
      console.error('An uncaught error occurred in worker!')
      console.error(err.stack)
  })

  process.on('unhandledRejection', (reason, p) => {
      console.error('Unhandled Rejection at reason:', reason)
      console.error(p)
  })
}