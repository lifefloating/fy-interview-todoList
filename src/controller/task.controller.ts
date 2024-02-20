import { Request, Response } from 'express';
import type { BasicTaskFilter, TaskSort } from '../service/task.service';
import { Task } from '../model/task';
import taskService from '../service/task.service';
import { BasicTask } from '../model/task';
import { UserDoc } from '../model/user';
import _ from 'lodash';

async function getList(req: Request, res: Response) {
  const { creator, createTimeStart, createTimeEnd, sort } = req.query;
  let filter = null;
  if (creator || createTimeStart || createTimeEnd) {
    filter = {
      creator,
      createTimeStart: parseInt(createTimeStart as string),
      createTimeEnd: parseInt(createTimeEnd as string),
    } as BasicTaskFilter;
  }

  let formatSort = null;
  if (sort) {
    const sortParams: string[] = (sort as string).split(',');
    if (sortParams[0] && sortParams[1]) {
      formatSort = {
        field: sortParams[0],
        direction: sortParams[1] === 'ASC' ? 1 : -1,
      } as TaskSort;
    }
  }

  try {
    const tasks = await taskService.getList(filter, formatSort);
    return res.status(200).send(tasks);
  } catch (err) {
    console.error('Error task getList:', err);
  }
  return res.status(500).send([]);
}

async function getTaskInfo(req: Request, res: Response) {
  const { todoId } = req.params;
  if (!todoId) {
    return res.status(401).send({});
  }

  try {
    const task = await taskService.getTaskInfo(todoId);
    return res.status(200).send(task);
  } catch (err) {
    console.error('Error task getTaskInfo:', err);
  }
  return res.status(500).send({});
}

async function getHistory(req: Request, res: Response) {
  const { todoId } = req.params;
  if (!todoId) {
    return res.status(401).send({});
  }

  try {
    const history = await taskService.getHistory(todoId);
    return res.status(200).send(history);
  } catch (err) {
    console.error('Error task getHistory:', err);
  }
  return res.status(500).send({});
}

async function create(req: Request, res: Response) {
  if (req.body) {
    const { text, planTime, asignees, remindTime, repeatPeriod, subTasks, parentTask } = req.body;
    if (!text) {
      return res.status(401).send({});
    }

    try {
      const task = await taskService.create({
        text,
        planTime,
        asignees: (asignees as UserDoc[])?.map(it => it._id),
        remindTime,
        repeatPeriod,
        subTasks,
        parentTask
      });
      return res.status(200).send(task);
    } catch (err) {
      console.error('Error task create:', err);
    }
  }
  return res.status(500).send({});
}

async function update(req: Request, res: Response) {
  const { todoId } = req.params;
  if (!todoId) {
    return res.status(401).send({});
  }

  const fields = ['text', 'planTime', 'asignees', 'followers', 'remindTime', 'repeatPeriod', 'subTasks', 'parentTask', 'status'];
  const params: BasicTask = {};
  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      const key = field;
      params[key] = req.body[key];
    }
  });

  const { followers, asignees } = req.body;
  if (followers) {
    params.followers = (followers as UserDoc[])?.map(it => it._id);
  }
  if (asignees) {
    params.asignees = (asignees as UserDoc[])?.map(it => it._id);
  }

  const todoInfo = await Task.findById(todoId).lean<BasicTask>()
  if (todoInfo?.subTasks) {
    // 存在子任务
    const prsList = []
    for (const subtask of todoInfo.subTasks) {
      prsList.push(
        Task.findById(subtask).lean<BasicTask>()
      )
    }
    const subTasksInfo = await Promise.all(prsList)
    const unfinishedTask = _.find(subTasksInfo || [], item => {
      return item.status == 0
    })
    if (_.isEmpty(unfinishedTask)) {
      params.status = 1
    }

  }
  try {
    await taskService.update(todoId, params);
    return res.status(200).send({ re: 'ok' });
  } catch (err) {
    console.error('Todo更新失败:', err);
  }
  return res.status(500).send({});
}

export default {
  getList,
  getTaskInfo,
  getHistory,
  create,
  update,
}