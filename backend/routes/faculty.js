const express = require('express');
const Faculty = require('../models/Faculty');
const Review = require('../models/Review');
const router = express.Router();

// Get all faculty members
router.get('/', async (req, res) => {
  try {
    const faculty = await Faculty.find();
    res.json(faculty);
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({ error: 'Failed to fetch faculty' });
  }
});

// Get faculty by department
router.get('/department/:department', async (req, res) => {
  try {
    const faculty = await Faculty.find({ department: req.params.department }, 'name department');
    res.json(faculty);
  } catch (error) {
    console.error('Error fetching faculty by department:', error);
    res.status(500).json({ error: 'Failed to fetch faculty' });
  }
});

// Add new faculty member
router.post('/', async (req, res) => {
  try {
    const { name, email, department, subject, phone } = req.body;
    
    // Check if faculty already exists
    const existingFaculty = await Faculty.findOne({ email });
    if (existingFaculty) {
      return res.status(400).json({ error: 'Faculty with this email already exists' });
    }

    const newFaculty = new Faculty({
      name,
      email,
      department,
      subject,
      phone
    });

    await newFaculty.save();
    res.status(201).json({ message: 'Faculty added successfully', faculty: newFaculty });
  } catch (error) {
    console.error('Error adding faculty:', error);
    res.status(500).json({ error: 'Failed to add faculty' });
  }
});

// Update faculty member
router.put('/:id', async (req, res) => {
  try {
    const { name, email, department, subject, phone } = req.body;
    
    const updatedFaculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      { name, email, department, subject, phone },
      { new: true, runValidators: true }
    );

    if (!updatedFaculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    res.json({ message: 'Faculty updated successfully', faculty: updatedFaculty });
  } catch (error) {
    console.error('Error updating faculty:', error);
    res.status(500).json({ error: 'Failed to update faculty' });
  }
});

// Delete faculty member
router.delete('/:id', async (req, res) => {
  try {
    const deletedFaculty = await Faculty.findByIdAndDelete(req.params.id);
    
    if (!deletedFaculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    res.status(500).json({ error: 'Failed to delete faculty' });
  }
});

// Get faculty with their average ratings
router.get('/with-ratings', async (req, res) => {
  try {
    const faculty = await Faculty.find();
    const reviews = await Review.find();
    
    // Calculate ratings for each faculty
    const facultyWithRatings = faculty.map(facultyMember => {
      const facultyReviews = reviews.filter(review => {
        return review.teacherName.toLowerCase().trim() === facultyMember.name.toLowerCase().trim() &&
               review.teacherDepartment.toLowerCase().trim() === facultyMember.department.toLowerCase().trim();
      });
      
      let averageRating = 0;
      const reviewCount = facultyReviews.length;
      
      if (reviewCount > 0) {
        const totalRating = facultyReviews.reduce((sum, review) => {
          return sum + (parseFloat(review.overallEvaluation) || 0);
        }, 0);
        averageRating = parseFloat((totalRating / reviewCount).toFixed(1));
      }
      
      return {
        ...facultyMember.toObject(),
        averageRating,
        reviewCount,
        hasReviews: reviewCount > 0
      };
    });
    
    res.json(facultyWithRatings);
  } catch (error) {
    console.error('Error fetching faculty with ratings:', error);
    res.status(500).json({ error: 'Failed to fetch faculty with ratings' });
  }
});

module.exports = router; 