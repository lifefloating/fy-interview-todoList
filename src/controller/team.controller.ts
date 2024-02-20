import { Request, Response } from 'express';
import { Team } from '../model/team';



async function createTeam(req: Request, res: Response) {
  const { teamName, desc, creator, todo, users } = req.body;
  try {
    await Team.create({ teamName, desc, creator, todo, users});
    res.status(201).json({ message: '创建团队成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
}

async function removeTeam(req: Request, res: Response) {
  const { id } = req.body;

  try {
    await Team.deleteOne({ id })
    res.status(201).json({ message: '删除成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
}

async function updateTeam(req: Request, res: Response) {
    const { id } = req.params;
    const { teamName, desc, creator, todo, users } = req.body;
    try {
      await Team.findByIdAndUpdate(id, { teamName, desc, creator, todo, users});
      res.status(201).json({ message: '修改成功' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '服务器错误' });
    }
}

async function getTeams(req: Request, res: Response) {
    try {
      const teams = await Team.find({});
      return res.status(200).send(teams);
    } catch (err) {
      console.log('Error getTeams:', err);
    }
    return res.status(500).send([]);
  }


async function getTeamInfo(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const teamInfo = await Team.findById(id);
        return res.status(200).send(teamInfo);
    } catch (err) {
        console.log('Error getTeamInfo:', err);
    }
    return res.status(500).send([]);
}

export default {
  createTeam,
  removeTeam,
  updateTeam,
  getTeams,
  getTeamInfo
}