import express from 'express';
import UserController from '../controller/user.controller';

const router = express.Router();

/**
 * @swagger
 * /example:
 *   get:
 *     summary: 获取示例数据
 *     responses:
 *       {
 *        "message": "注册成功"
 *        }
 *         description: 成功获取示例数据
 */
router.get('/get', UserController.getList);

/**
 * @swagger
 * /example:
 *   get:
 *     summary: 获取示例数据
 *     responses:
 *       {
 *        "message": "注册成功"
 *        }
 *         description: 成功获取示例数据
 */
router.post('/register', UserController.register);

/**
 * @swagger
 * /example:
 *   get:
 *     summary: 获取示例数据
 *     responses:
 *       {
 *        "message": "注册成功"
 *        }
 *         description: 成功获取示例数据
 */
router.get('/login', UserController.login);

export {
  router
}