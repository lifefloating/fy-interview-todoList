import mongoose from "mongoose";

interface BasicRemark {
  content?: string;
  creator?: string;
  todoId?: string;
  replyUser?: string;
  createTime?: number;
  updateTime?: number;
}

interface RemarkDoc extends mongoose.Document, BasicRemark {}

const remarkSchema = new mongoose.Schema({
  todoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  replyUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createTime: {
    type: Number,
    required: true,
  },
  updateTime: {
    type: Number,
  }
});

interface remarkInterface extends mongoose.Model<Document> {
  prepare(): Promise<void>
}

const Remark = mongoose.model<Document, remarkInterface>('Remark', remarkSchema);

Remark.prepare = async () => {
  await Remark.collection.drop();
  await Remark.createCollection();

  await Remark.collection.createIndex({ todoId: 'hashed' });
}

export {
  BasicRemark,
  RemarkDoc,
  Remark,
}