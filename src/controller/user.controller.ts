import { Request, Response } from 'express';
import { User } from '../model/user';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Document, ObjectId } from 'mongoose';


async function register(req: Request, res: Response) {
  const { username, password } = req.body;

  try {
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已被使用' });
    }

    // 创建新用户
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(200).json({ message: '注册成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
}

async function login(req: Request, res: Response) {
  const { username, password } = req.body;

  try {
    // 检查用户是否存在
    const user = await User.findOne({ username }) as Document & {
      _id: ObjectId;
      password: string;
    };
    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password,  user?.password || '');
    if (!isPasswordValid) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 生成 JWT
    const token = jwt.sign({ userId: user._id }, 'secret_key');
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
}

async function getList(req: Request, res: Response) {
  try {
    const users = await User.find({});
    return res.status(200).send(users);
  } catch (err) {
    console.log('Error user getList:', err);
  }
  return res.status(500).send([]);
}


export default {
  getList,
  register,
  login
}