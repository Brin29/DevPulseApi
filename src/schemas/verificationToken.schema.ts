import bcrypt from "bcrypt";
import mongoose, { Schema, Model } from "mongoose";
import {
  IVerificationToken,
  IVerificationTokenMethods,
} from "../models/verificationToken.model";

type VerificationTokenModel = Model<
  IVerificationToken,
  {},
  IVerificationTokenMethods
>;

const VerificationTokenSchema = new Schema<
  IVerificationToken,
  VerificationTokenModel,
  IVerificationTokenMethods
>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      select: false,
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

VerificationTokenSchema.pre("save", async function () {
  if (!this.isModified("code")) return;
  this.code = await bcrypt.hash(this.code, 10);
});

VerificationTokenSchema.methods.compareCode = async function (code: string): Promise<boolean> {
  return bcrypt.compare(code, this.code);
};

const VerificationToken = mongoose.model<
  IVerificationToken, 
  VerificationTokenModel
>("VerificationToken", VerificationTokenSchema);

export default VerificationToken;
