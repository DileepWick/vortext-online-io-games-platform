import passport from "passport";
import GoogleStategy from "passport-google-oauth20";
import { User } from "../models/user.js";
import dotenv from "dotenv";
import { Cart } from "../models/cart.js";
import jwt from "jsonwebtoken";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            firstname: profile.name.givenName,
            lastname: profile.name.familyName,
            username: profile.name.givenName + "_" + Date.now(),
            email,
            googleId: profile.id,
            role: "User",
            birthday: null,
            age: null,
            playerType: "Adult",
          });

          await Cart.create({ owner: user._id });
        }

        const payload = {
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
          },
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

        return done(null, { user, token });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
