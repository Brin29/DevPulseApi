import mongoose, { Schema, Model, HydratedDocument } from "mongoose";

import bcrypt from "bcrypt";
import { IMagicLink } from "../models/magicLink.model";

type MagicLinkModel = Model<IMagicLink, {}>;

const MagicLinkSchema = new Schema<
  IMagicLink,
  MagicLinkModel
>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    token: {
      type: String,
      required: true,
      select: false,
    },

    used: {
      type: Boolean,
      default: false,
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

MagicLinkSchema.index({ userId: 1, token: 1 }, { unique: true });

// MagicLinkSchema.pre<HydratedDocument<IMagicLink, IMagicLinkMethods>>(
//   "save",
//   async function () {
//     // evitar rehash
//     if (!this.isModified("token")) {
//       return;
//     }

//     const salt = await bcrypt.genSalt(10);

//     this.token = await bcrypt.hash(this.token, salt);
//   },
// );

// MagicLinkSchema.methods.compareToken = async function (
//   token: string,
// ): Promise<boolean> {
//   return bcrypt.compare(token, this.token);
// };

const MagicLink = mongoose.model<IMagicLink, MagicLinkModel>(
  "MagicLink",
  MagicLinkSchema,
);

export default MagicLink;
