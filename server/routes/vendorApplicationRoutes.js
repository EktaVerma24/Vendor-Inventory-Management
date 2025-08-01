const express = require('express');
const router = express.Router();
const VendorApplication = require('../models/VendorApplication');
const Vendor = require('../models/Vendor');
const bcrypt = require('bcryptjs');
const { generateCredentials, sendApprovalEmail, sendRejectionEmail } = require('../utils/emailService');

// Submit vendor application
router.post('/submit', async (req, res) => {
    try {
        const applicationData = req.body;
        
        // Check if application already exists for this email
        const existingApplication = await VendorApplication.findOne({ email: applicationData.email });
        if (existingApplication) {
            return res.status(400).json({ message: 'Application already exists for this email' });
        }

        const application = new VendorApplication(applicationData);
        await application.save();

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            applicationNumber: application.applicationNumber
        });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ message: 'Error submitting application', error: error.message });
    }
});

// Get all applications (admin only)
router.get('/', async (req, res) => {
    try {
        const applications = await VendorApplication.find().sort({ createdAt: -1 });
        res.json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ message: 'Error fetching applications', error: error.message });
    }
});

// Get application by ID
router.get('/:id', async (req, res) => {
    try {
        const application = await VendorApplication.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }
        res.json(application);
    } catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({ message: 'Error fetching application', error: error.message });
    }
});

// Update application status (approve/reject)
router.patch('/:id/status', async (req, res) => {
    try {
        const { status, reviewedBy } = req.body;
        const application = await VendorApplication.findById(req.params.id);
        
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        application.status = status;
        application.reviewedBy = reviewedBy;
        application.reviewedAt = new Date();

        await application.save();

        // If approved, create vendor account and send email
        if (status === 'approved') {
            const password = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(password, 10);

            const vendor = new Vendor({
                email: application.email,
                password: hashedPassword,
                name: application.ownerName,
                businessName: application.businessName,
                applicationId: application._id,
                businessType: application.businessType,
                taxId: application.taxId,
                businessLicense: application.businessLicense,
                phone: application.phone,
                address: application.address,
                city: application.city,
                state: application.state,
                zipCode: application.zipCode,
                preferredTerminals: application.preferredTerminals,
                shopType: application.shopType,
                expectedRevenue: application.expectedRevenue,
                description: application.description,
                website: application.website,
                socialMedia: application.socialMedia
            });

            await vendor.save();

            // Send approval email with credentials
            try {
                await sendApprovalEmail(application.email, application.ownerName, {
                    loginId: application.email,
                    password: password
                });
            } catch (emailError) {
                console.error('Error sending approval email:', emailError);
                // Continue even if email fails
            }

            res.json({
                success: true,
                message: 'Application approved, vendor account created, and approval email sent',
                vendor: {
                    email: vendor.email,
                    password: password, // Return plain password for admin to share
                    name: vendor.name,
                    businessName: vendor.businessName
                }
            });
        } else if (status === 'rejected') {
            // Send rejection email
            try {
                await sendRejectionEmail(application.email, application.ownerName, req.body.reason || '');
            } catch (emailError) {
                console.error('Error sending rejection email:', emailError);
                // Continue even if email fails
            }

            res.json({
                success: true,
                message: `Application ${status} and rejection email sent`,
                application
            });
        } else {
            res.json({
                success: true,
                message: `Application ${status}`,
                application
            });
        }
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ message: 'Error updating application status', error: error.message });
    }
});

// Get applications by status
router.get('/status/:status', async (req, res) => {
    try {
        const applications = await VendorApplication.find({ status: req.params.status }).sort({ createdAt: -1 });
        res.json(applications);
    } catch (error) {
        console.error('Error fetching applications by status:', error);
        res.status(500).json({ message: 'Error fetching applications', error: error.message });
    }
});

// Check application status by email
router.get('/check/:email', async (req, res) => {
    try {
        const application = await VendorApplication.findOne({ email: req.params.email });
        if (!application) {
            return res.status(404).json({ message: 'No application found for this email' });
        }
        res.json({
            status: application.status,
            applicationNumber: application.applicationNumber,
            submittedAt: application.createdAt
        });
    } catch (error) {
        console.error('Error checking application status:', error);
        res.status(500).json({ message: 'Error checking application status', error: error.message });
    }
});

module.exports = router; 