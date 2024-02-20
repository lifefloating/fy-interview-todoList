import express from 'express';
import TeamController from '../controller/team.controller';

const router = express.Router();

router.post('/create', TeamController.createTeam);
router.post('/delete', TeamController.removeTeam);
router.put('/update/:id', TeamController.updateTeam);
router.get('/teams', TeamController.getTeams);
router.get('/team/:id', TeamController.getTeamInfo);

export {
  router
}