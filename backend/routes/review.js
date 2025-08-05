const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Endpoint to submit review
router.post('/', async (req, res) => {
    const { studentName, admissionNo, branchSemester, teacherName, teacherSubject, teacherDepartment, ratings, suggestions, overallEvaluation } = req.body;

    try {
        // Calculate overall evaluation from ratings if not provided or seems incorrect
        let calculatedOverall = overallEvaluation;
        
        if (ratings && typeof ratings === 'object') {
            const ratingValues = Object.values(ratings).filter(val => typeof val === 'number' && val > 0);
            if (ratingValues.length > 0) {
                calculatedOverall = parseFloat((ratingValues.reduce((sum, rating) => sum + rating, 0) / ratingValues.length).toFixed(1));
            }
        }

        const newReview = new Review({
            studentName,
            admissionNo,
            branchSemester,
            teacherName,
            teacherSubject,
            teacherDepartment,
            ratings,
            suggestions,
            overallEvaluation: calculatedOverall
        });

        await newReview.save();
        res.json({ message: 'Review submitted successfully', review: newReview });
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ error: 'Failed to submit review' });
    }
});

router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find();
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Endpoint to get reviews for a specific teacher
router.post('/filter', async (req, res) => {
    const { teacherName, teacherDepartment, branchSemester } = req.body;

    try {
        const reviews = await Review.find({
            teacherName,
            teacherDepartment,
            branchSemester
        });

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Get reviews by faculty name and department
router.get('/faculty/:name/:department', async (req, res) => {
    try {
        const { name, department } = req.params;
        const reviews = await Review.find({
            teacherName: name,
            teacherDepartment: department
        });
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Update review
router.put('/:id', async (req, res) => {
    try {
        const { studentName, admissionNo, branchSemester, teacherName, teacherSubject, teacherDepartment, ratings, suggestions, overallEvaluation } = req.body;
        
        // Calculate overall evaluation from ratings if not provided or seems incorrect
        let calculatedOverall = overallEvaluation;
        
        if (ratings && typeof ratings === 'object') {
            const ratingValues = Object.values(ratings).filter(val => typeof val === 'number' && val > 0);
            if (ratingValues.length > 0) {
                calculatedOverall = parseFloat((ratingValues.reduce((sum, rating) => sum + rating, 0) / ratingValues.length).toFixed(1));
            }
        }
        
        const updatedReview = await Review.findByIdAndUpdate(
            req.params.id,
            {
                studentName,
                admissionNo,
                branchSemester,
                teacherName,
                teacherSubject,
                teacherDepartment,
                ratings,
                suggestions,
                overallEvaluation: calculatedOverall
            },
            { new: true, runValidators: true }
        );

        if (!updatedReview) {
            return res.status(404).json({ error: 'Review not found' });
        }

        res.json({ message: 'Review updated successfully', review: updatedReview });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ error: 'Failed to update review' });
    }
});

// Delete review
router.delete('/:id', async (req, res) => {
    try {
        const deletedReview = await Review.findByIdAndDelete(req.params.id);
        
        if (!deletedReview) {
            return res.status(404).json({ error: 'Review not found' });
        }

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

// Get faculty ratings summary
router.get('/faculty-ratings', async (req, res) => {
    try {
        const reviews = await Review.find();
        
        // Group reviews by faculty (teacherName + teacherDepartment)
        const facultyRatings = {};
        
        reviews.forEach(review => {
            const facultyKey = `${review.teacherName}_${review.teacherDepartment}`;
            
            if (!facultyRatings[facultyKey]) {
                facultyRatings[facultyKey] = {
                    teacherName: review.teacherName,
                    teacherDepartment: review.teacherDepartment,
                    teacherSubject: review.teacherSubject,
                    reviews: [],
                    totalRating: 0,
                    averageRating: 0,
                    reviewCount: 0
                };
            }
            
            facultyRatings[facultyKey].reviews.push(review);
            facultyRatings[facultyKey].totalRating += parseFloat(review.overallEvaluation) || 0;
            facultyRatings[facultyKey].reviewCount++;
        });
        
        // Calculate average ratings
        Object.keys(facultyRatings).forEach(facultyKey => {
            const faculty = facultyRatings[facultyKey];
            faculty.averageRating = parseFloat((faculty.totalRating / faculty.reviewCount).toFixed(1));
        });
        
        // Convert to array and sort by average rating
        const sortedFacultyRatings = Object.values(facultyRatings)
            .sort((a, b) => b.averageRating - a.averageRating);
        
        res.json(sortedFacultyRatings);
    } catch (error) {
        console.error('Error fetching faculty ratings:', error);
        res.status(500).json({ error: 'Failed to fetch faculty ratings' });
    }
});

// Validate and recalculate all review ratings - Admin utility endpoint
router.post('/validate-ratings', async (req, res) => {
    try {
        const reviews = await Review.find();
        let updatedCount = 0;
        
        for (const review of reviews) {
            if (review.ratings && typeof review.ratings === 'object') {
                const ratingValues = Object.values(review.ratings).filter(val => typeof val === 'number' && val > 0);
                if (ratingValues.length > 0) {
                    const calculatedOverall = parseFloat((ratingValues.reduce((sum, rating) => sum + rating, 0) / ratingValues.length).toFixed(1));
                    
                    // Update if the calculated rating is different from stored rating
                    if (Math.abs(calculatedOverall - review.overallEvaluation) > 0.1) {
                        await Review.findByIdAndUpdate(review._id, { overallEvaluation: calculatedOverall });
                        updatedCount++;
                    }
                }
            }
        }
        
        res.json({ 
            message: `Validation complete. Updated ${updatedCount} review(s).`,
            totalReviews: reviews.length,
            updatedReviews: updatedCount
        });
    } catch (error) {
        console.error('Error validating ratings:', error);
        res.status(500).json({ error: 'Failed to validate ratings' });
    }
});

module.exports = router;
