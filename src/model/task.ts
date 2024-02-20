import mongoose from "mongoose";

interface BasicTask {
  creator?: string;
  text?: string;
  createTime?: number;
  planTime?: number;
  updateTime?: number;
  finishTime?: number;
  remindTime?: number;
  repeatPeriod?: number;
  asignees?: string[];
  followers?: string[];
  subTasks?: string[];
  parentTask?: string;
  status?: number;
}

interface TaskDoc extends mongoose.Document, BasicTask {}

const todoSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String, 
    required: true,
  },
  createTime: {
    type: Number,
    required: true,
  },
  updateTime: {
    type: Number,
  },
  planTime: {
    type: Number,
  },
  finishTime: {
    type: Number,
  },
  remindTime: {
    type: Number,
  },
  repeatPeriod: {
    type: Number,
  },
  followers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
  },
  asignees: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
  },
  subTasks: { //子任务
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Task",
  },
  parentTask: { // 父任务
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
  },
  status: { // 1完成 0进行中
    type: Number,
  }
});

interface todoInterface extends mongoose.Model<Document> {
  prepare(): Promise<void>
}

const Task = mongoose.model<TaskDoc, todoInterface>('Task', todoSchema);

Task.prepare = async () => {
  await Task.collection.drop();
  await Task.createCollection();

  await Task.collection.createIndex({ followers: 1, createTime: -1 });
  await Task.collection.createIndex({ followers: 1, planTime: -1 });
}

export {
  BasicTask,
  TaskDoc,
  Task,
}
