import express from 'express';
import TodoController from '../controller/task.controller';
import CommentController from '../controller/comment.controller';

const router = express.Router();


/**
 * @swagger
 * /example:
 *   get:
 *     summary: 获取示例数据
 *     responses:
 *       '200':
 *         description: 成功获取示例数据
 */
router.get('/getList', TodoController.getList);
router.post('/create', TodoController.create);
router.put('/:todoId/update', TodoController.update);
router.get('/get/:todoId', TodoController.getTaskInfo);
router.get('/get/:todoId/history', TodoController.getHistory);

router.get('/get/:todoId/comment', CommentController.get);
router.post('/comment/create', CommentController.create);
router.put('/comment/:commentId/update', CommentController.update);

export {
  router
}