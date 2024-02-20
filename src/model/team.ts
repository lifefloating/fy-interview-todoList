import mongoose from "mongoose";

interface BasicTeam {
  teamName?: string;
  desc?: string;
  creator: string;
  users?: string[];
  todo?: string;
}

const teamSchema = new mongoose.Schema({
  teamName: {
    type: String, 
    require: true,
  },
  desc: {
    type: String, 
    require: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  users: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
  },
  todo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
  }
});

interface TeamDoc extends mongoose.Document, BasicTeam {}

interface userInterface extends mongoose.Model<Document> {
  prepare(): Promise<void>
}

const Team = mongoose.model<TeamDoc, userInterface>('Team', teamSchema);



export {
  BasicTeam,
  TeamDoc,
  Team,
}
