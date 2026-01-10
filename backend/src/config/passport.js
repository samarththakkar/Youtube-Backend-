import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { User } from '../models/user.model.js';

const generateDefaultAvatar = (name) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const firstLetter = name.charAt(0).toUpperCase();
    const colorIndex = name.charCodeAt(0) % colors.length;
    const backgroundColor = colors[colorIndex];
    
    return `https://ui-avatars.com/api/?name=${firstLetter}&background=${backgroundColor.slice(1)}&color=fff&size=200`;
}

const generateDefaultCoverImage = (userId) => {
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    ];
    
    const gradientIndex = userId.toString().charCodeAt(0) % gradients.length;
    return `https://via.placeholder.com/800x200/${gradients[gradientIndex].slice(-6)}/${gradients[gradientIndex].slice(-6)}`;
}

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/v1/users/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ 
            $or: [{ googleId: profile.id }, { email: profile.emails[0].value }] 
        });

        if (!user) {
            const username = profile.emails[0].value.split('@')[0] + Math.random().toString(36).substr(2, 4);
            
            user = await User.create({
                fullname: profile.displayName,
                email: profile.emails[0].value,
                username,
                googleId: profile.id,
                provider: 'google',
                avatar: profile.photos[0]?.value || generateDefaultAvatar(profile.displayName),
                coverImage: generateDefaultCoverImage(Date.now().toString()),
                isEmailVerified: true
            });
            
            user.coverImage = generateDefaultCoverImage(user._id);
            await user.save();
        }

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// Facebook OAuth Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/api/v1/users/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'emails', 'photos']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ 
            $or: [{ facebookId: profile.id }, { email: profile.emails[0].value }] 
        });

        if (!user) {
            const username = profile.emails[0].value.split('@')[0] + Math.random().toString(36).substr(2, 4);
            
            user = await User.create({
                fullname: profile.displayName,
                email: profile.emails[0].value,
                username,
                facebookId: profile.id,
                provider: 'facebook',
                avatar: profile.photos[0]?.value || generateDefaultAvatar(profile.displayName),
                coverImage: generateDefaultCoverImage(Date.now().toString()),
                isEmailVerified: true
            });
            
            user.coverImage = generateDefaultCoverImage(user._id);
            await user.save();
        }

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;