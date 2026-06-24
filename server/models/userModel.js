const  mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      default: null
    },
    avatar: {
      type: String,
      default: "",
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

//hash Password
userSchema.pre("save", async function() {
    if (!this.password || !this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});
//check Password
userSchema.methods.comparePassword = async function (pass) {
    if (!this.password) return false;
    return await bcrypt.compare(pass,this.password);
}
module.exports = mongoose.model("User",userSchema);