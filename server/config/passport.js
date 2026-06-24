const passport = require("passport");
const googleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");

passport.use(
  new googleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (acessToken, refreshToken, profile, done) => {
      try {
        //already exisiting google user
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          user.googleId = profile.id;
          user.authProvider = "google";
          if (!user.avatar) user.avatar = profile.photos[0]?.value || "";
          await user.save();
          return done(null, user);
        }

        //creating new user
        const username = await generateUniqueUsername(profile.displayName);

        user = await User.create({
          username,
          email: profile.emails[0].value,
          googleId: profile.id,
          avatar: profile.photos[0]?.value || "",
          authProvider: "google",
          password: null,
        });
        return done(null, user);
      } catch (error) {
        return done(error,null);
      }
    },
  ),
);

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
module.exports = passport;
