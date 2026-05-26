import mongoose, { Schema, Model } from "mongoose";
import { ITeam } from "../models/team.model";

type TeamModel = Model<ITeam>;

const TeamSchema = new Schema<ITeam, TeamModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    logo: {
      type: String,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

TeamSchema.virtual("members", {
  ref: "OrganizationMember",
  localField: "_id",
  foreignField: "teamId",
});

TeamSchema.virtual("projects", {
  ref: "Project",
  localField: "_id",
  foreignField: "teamId",
});

const Team = mongoose.model<ITeam, TeamModel>("Team", TeamSchema);

export default Team;
