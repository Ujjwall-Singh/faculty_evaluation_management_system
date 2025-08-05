const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    studentName: { type: String, required: true },
    admissionNo: { type: String, required: true },
    branchSemester: { type: String, required: true },
    teacherName: { type: String, required: true },
    teacherSubject: { type: String, required: true },
    teacherDepartment: { type: String, required: true },
    ratings: {
        conceptExplanation: Number,
        subjectKnowledge: Number,
        contentOrganization: Number,
        classTiming: Number,
        learningEnvironment: Number,
        studentParticipation: Number,
        feedbackQuality: Number,
        resourceUtilization: Number,
        innovation: Number,
        accessibility: Number,
        supportiveness: Number,
        professionalism: Number
    },
    suggestions: { type: String },
    overallEvaluation: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
