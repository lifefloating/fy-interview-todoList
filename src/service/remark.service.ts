import mongoose from "mongoose";

import { Remark, BasicRemark, RemarkDoc } from '../model/remark';

async function get(todoId: string) {
  const Remarks = await Remark.aggregate([
    {
      $match: {
        todoId: new mongoose.Types.ObjectId(todoId)
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
        localField: 'replyUser',
        foreignField: '_id',
        as: 'replyUser',
      }
    },
    { 
      $sort : {
        createTime : 1
      }
    },
  ]);
  return Remarks;
}

async function create(params: BasicRemark) {
  const now = new Date().getTime();
  const creator = process.env.fakeUserId || '';
  
  let newRemark;
    newRemark = await new Remark({
      ...params,
      creator,
      createTime: now,
    }).save();

  return newRemark;
}

async function update(RemarkId: string, params: BasicRemark) {
  const now = new Date().getTime();
  const creator = process.env.fakeUserId || '';
  const target: RemarkDoc | null = await Remark.findById(RemarkId).exec();
  if (target) {
    await Remark.updateOne({ _id: RemarkId }, {
      ...params,
      updateTime: new Date().getTime()
    });
  }

}

export default {
  get,
  create,
  update,
}