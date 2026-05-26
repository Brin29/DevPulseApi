import mongoose, { Schema, Model } from "mongoose";
import { IProject } from "../models/project.model";

type ProjectModel = Model<IProject>;

const ProjectSchema = new Schema<IProject, ProjectModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["Active", "Archived", "Completed"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  },
);

const Project = mongoose.model<IProject, ProjectModel>("Project", ProjectSchema);

export default Project;
