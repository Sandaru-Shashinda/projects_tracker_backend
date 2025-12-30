import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import { IUserSchema, ROLE } from "./auth.types"

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(ROLE),
      default: ROLE.PUBLIC_USER,
    },
    ministryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ministry' },
  },
  { timestamps: true }
)

// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password)
}

export const User = mongoose.model<IUserSchema>("User", UserSchema)
