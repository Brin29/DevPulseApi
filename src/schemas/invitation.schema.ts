import mongoose, { Schema, Model } from "mongoose";
import { IInvitation } from "../models/invitation.model";

type InvitationModel = Model<IInvitation>;

const InvitationSchema = new Schema<IInvitation, InvitationModel>(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Developer", "Viewer"],
      default: "Developer",
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired"],
      default: "pending",
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Invitation = mongoose.model<IInvitation, InvitationModel>(
  "Invitation",
  InvitationSchema,
);

export default Invitation;
