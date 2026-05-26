import mongoose, { Schema, Model } from "mongoose";
import { IOrganizationMember } from "../models/organizationMember.model";

type OrganizationMemberModel = Model<IOrganizationMember>;

const OrganizationMemberSchema = new Schema<
  IOrganizationMember,
  OrganizationMemberModel
>(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Developer", "Viewer"],
      default: "Developer",
    },
  },
  {
    timestamps: true,
  },
);

OrganizationMemberSchema.index({ teamId: 1, userId: 1 }, { unique: true });

const OrganizationMember = mongoose.model<
  IOrganizationMember,
  OrganizationMemberModel
>("OrganizationMember", OrganizationMemberSchema);

export default OrganizationMember;
