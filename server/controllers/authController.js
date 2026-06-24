const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
//generate tokens
const generateToken = function (userId) {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "1d",
  });
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );
  return { accessToken, refreshToken };
};

// send refresh token as httpOnly cookie
const setRefreshCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields Required!" });
    }
    const isExist = await User.findOne({ $or: [{ email }, { username }] });
    if (isExist) {
      return res
        .status(409)
        .json({ message: "UserName or UserEmail already Exist!" });
    }
    const newUser = await User.create({ username, email, password });
    const { accessToken, refreshToken } = generateToken(newUser._id);
    newUser.refreshToken = refreshToken;
    await newUser.save();
    setRefreshCookie(res, refreshToken);
    res.status(200).json({
      message: "user Registered Succesfully!",
      accessToken,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message : "All fields Required"});
    }
    const user = await User.findOne({email});
    if(!user){
        return res.status(401).json({message : "Invalid credentials"});
    }
    const isRight = await user.comparePassword(password);
    if(!isRight){
        return res.status(401).json({message : "Invalid credentials"});
    }

    const { accessToken , refreshToken } = generateToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();
    setRefreshCookie(res, refreshToken);
    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//refresh token when expires old one
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken } = generateToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(403).json({ message: "Token expired or invalid" });
  }
};

// LOGOUT
const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const user = await User.findOne({ refreshToken: token });
      if (user) {
        user.refreshToken = "";
        await user.save();
      }
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET ME (protected)
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -refreshToken");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//google auth
const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "No credential provided" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        if (!user.avatar) user.avatar = picture || "";
        await user.save();
      } else {
        const username = await generateUniqueUsername(name);
        user = await User.create({
          username,
          email,
          googleId,
          avatar: picture || "",
          authProvider: "google",
          password: null,
        });
      }
    }

    const { accessToken, refreshToken } = generateToken(user._id); // ✅ generateTokens
    user.refreshToken = refreshToken;
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.status(200).json({
      message: "Google login successful",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.log("Google auth error:", error.message); 
    res.status(400).json({ message: "Invalid Google credential", error: error.message });
  }
};

async function generateUniqueUsername(name){
    let base = (name || "user").replace(/\s+/g,"").toLowerCase().slice(0,15);
    let username = base;
    let count = 1;
    while(await User.findOne({username})){
        username = `${base}${count}`;
        count++;
    }
    return username;
}
module.exports = {register,login,refreshToken,logout,getMe,googleAuth};