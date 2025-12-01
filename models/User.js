
const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 3 },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    profile_image: { type: String, default: '' }, // path or URL
    address: { type: String, maxlength: 150, default: '' },
    state: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    pincode: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    refreshTokens: [RefreshTokenSchema],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
})

// index for faster searching by name/email/state/city
UserSchema.index({ name: 'text', email: 'text', state: 'text', city: 'text' });

module.exports = mongoose.model('User', UserSchema);
