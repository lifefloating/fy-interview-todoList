import mongoose from "mongoose";

interface BasicUser {
  nickname?: string;
  password?: string;
}

const userSchema = new mongoose.Schema({
  nickname: {
    type: String, 
    require: true,
  },
  password: {
    type: String, 
    require: true,
  },
});

interface UserDoc extends mongoose.Document, BasicUser {}

interface userInterface extends mongoose.Model<Document> {
  prepare(): Promise<void>
}

const User = mongoose.model<UserDoc, userInterface>('User', userSchema);

User.prepare = async () => {
  await User.collection.drop();
  await User.createCollection();

  const fakeUser = await new User({ nickname: 'test1', password: '123456' }).save();
  process.env.fakeUserId = fakeUser._id.toString();

  await new User({ nickname: 'test2', password: '123456' }).save();
}

export {
  BasicUser,
  UserDoc,
  User,
}
