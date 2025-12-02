const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose

const objectId = Schema.ObjectId;

const adminSchema = new Schema({
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
})

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
})

const jobSchema = new Schema({
    id: objectId,
    title: String,
    rating: Number,
    companyLogoUrl: String,
    location: String,
    jobDescription: String,
    employmentType: String,
    packagePerAnnum: String,
    creatorId: { type: Types.ObjectId, ref: 'Admin', required: true }
});

const jobApplicationSchema = new Schema({
    jobId: { type: Types.ObjectId, required: true },
    userId: { type: Types.ObjectId, required: true },
    job: Object
})

const profileSchema = new Schema({
    profileImageUrl: String,
    name: String,
    shortBio: String
})

const adminModel = model('Admin', adminSchema);
const userModel = model("User", userSchema);
const jobModel = model('Job', jobSchema);
const jobApplicationModel = model('JobApplication', jobApplicationSchema);
const profileModel = model('Profile', profileSchema);

module.exports = { adminModel, userModel, jobModel, jobApplicationModel, profileModel };