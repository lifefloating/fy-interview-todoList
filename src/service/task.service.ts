import mongoose from "mongoose";
import { Task, BasicTask, TaskDoc } from "../model/task";
import { History, HistoryDoc } from "../model/history";

interface BasicTaskFilter {
  creator?: string;
  createTimeStart?: number;
  createTimeEnd?: number;
}

interface TaskSort {
  field: string;
  direction: 1 | -1;
}

async function getList(filter: BasicTaskFilter | null, sort: TaskSort | null = null) {
  const matchConfig: Record<string, any> = {};
  if (filter?.creator) {
    matchConfig.asignees = new mongoose.Types.ObjectId(filter.creator);
    matchConfig.creator = new mongoose.Types.ObjectId(filter.creator);
    matchConfig.followers = new mongoose.Types.ObjectId(filter.creator);
  }
  if (filter?.createTimeStart && filter?.createTimeEnd) {
    matchConfig.createTime = {
      $gte: filter.createTimeStart,
      $lte: filter.createTimeEnd,
    };
  }

  let sortConfig: Record<string, 1 | -1> = { createTime : -1 };
  if (sort) {
    sortConfig = {
      [sort.field]: sort.direction
    }
  }

  const tasks = await Task.aggregate([
    {
      $match: {
        status: { $ne: -1 },
        ...matchConfig,
     }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'creator',
        foreignField: '_id',
        as: 'creator',
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'asignees',
        foreignField: '_id',
        as: 'asignees',
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'followers',
        foreignField: '_id',
        as: 'followers',
      }
    },
    { $sort : sortConfig },
    { $limit: 100 }
  ]);
  return tasks;
}

async function getTaskInfo(todoId: string) {
  const task = await Task.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(todoId) } },
    {
      $lookup: {
        from: 'users',
        localField: 'creator',
        foreignField: '_id',
        as: 'creator',
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'asignees',
        foreignField: '_id',
        as: 'asignees',
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'followers',
        foreignField: '_id',
        as: 'followers',
      }
    }
  ]);
  return task.length > 0 ? task[0] : null;
}

async function getHistory(todoId: string) {
  const history = await History.aggregate([
    { $match: { todoId: new mongoose.Types.ObjectId(todoId) } },
    {
      $addFields: {
        value: '$value',
        valueExt: {
          $function: {
            body: function(rawStr: string | undefined) {
              if (rawStr?.startsWith('[')) {
                try {
                  const arr: string[] = JSON.parse(rawStr);
                  return arr;
                } catch {}
              }
              return [];
            },
            args: ['$value'],
            lang: 'js'
          }
        }
      }
    },
    {
      $addFields: {
        userObjectIds: {
          $map: {
            input: '$valueExt',
            as: 'it',
            in: { $toObjectId: '$$it' }
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userObjectIds',
        foreignField: '_id',
        as: 'valueExt',
      }
    },
    { $unset: 'userObjectIds' },
    { $sort : { createTime : 1 } },
  ]);
  return history.map(it => ({
    ...it,
    value: ['asignees', 'followers'].includes(it.field) ? JSON.stringify(it.valueExt) : it.value,
    valueExt: undefined,
  }));
}

async function update(todoId: string, params: BasicTask) {
  const now = new Date().getTime();
  const creator = process.env.fakeUserId || ''; // <-- hard code

  const target: TaskDoc | null = await Task.findById(todoId).exec();
  if (target) {
    let followers = params.followers ? params.followers : target.followers;
    if (!followers?.includes(creator)) {
      followers?.push(creator);
    }
    let asignees = params.asignees ? params.asignees : target.asignees;
    asignees?.forEach(it => !followers?.includes(it) && followers?.push(it));

    await Task.updateOne({ _id: todoId }, {
      ...params,
      followers,
      asignees,
      updateTime: now,
      finishTime: params.status === 2 ? now : 0
    });

    const histories: HistoryDoc[] = [];
    Object.keys(params).forEach(key => {
      if (params[key as keyof BasicTask]) {
        histories.push(new History({
          todoId,
          actionType: 'update',
          field: key,
          value: JSON.stringify(params[key as keyof BasicTask]),
          createTime: new Date().getTime(),
          operator: creator,
        }));
      }
    });
    await History.collection.insertMany(histories);
  }
}

async function create(params: BasicTask) {
  let newTask;
  const creator = process.env.fakeUserId || '';
  let followers = [creator];
  if (params.asignees) {
    followers = params.asignees.includes(creator) ? [...params.asignees] : [...params.asignees, creator];
  }

  newTask = await new Task({
    ...params,
    creator,
    createTime: new Date().getTime(),
    followers,
    status: 0,
  }).save();

  await new History({
    todoId: newTask._id,
    actionType: 'create',
    createTime: new Date().getTime(),
    operator: creator,
  }).save();
  return newTask;
}

export type {
  BasicTaskFilter,
  TaskSort,
}

export default {
  getList,
  getTaskInfo,
  getHistory,
  create,
  update,
}