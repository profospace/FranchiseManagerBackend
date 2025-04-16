// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Franchise Schema
const franchiseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    company: { type: String, required: true },
    contactName: { type: String, required: true },
    contactEmail: { type: String },
    contactPhone: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const Franchise = mongoose.model('Franchise', franchiseSchema);

// API Routes
// Get all franchises
app.get('/api/franchises', async (req, res) => {
    try {
        const franchises = await Franchise.find().sort({ createdAt: -1 });
        res.json(franchises);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching franchises', error: err.message });
    }
});

// Get single franchise
app.get('/api/franchises/:id', async (req, res) => {
    try {
        const franchise = await Franchise.findById(req.params.id);
        if (!franchise) {
            return res.status(404).json({ message: 'Franchise not found' });
        }
        res.json(franchise);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching franchise', error: err.message });
    }
});

// Create franchise
app.post('/api/franchises', async (req, res) => {
    try {
        const newFranchise = new Franchise(req.body);
        const savedFranchise = await newFranchise.save();
        res.status(201).json(savedFranchise);
    } catch (err) {
        res.status(400).json({ message: 'Error creating franchise', error: err.message });
    }
});

// Update franchise
app.put('/api/franchises/:id', async (req, res) => {
    try {
        const updatedFranchise = await Franchise.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedFranchise) {
            return res.status(404).json({ message: 'Franchise not found' });
        }
        res.json(updatedFranchise);
    } catch (err) {
        res.status(400).json({ message: 'Error updating franchise', error: err.message });
    }
});

// Delete franchise
app.delete('/api/franchises/:id', async (req, res) => {
    try {
        const deletedFranchise = await Franchise.findByIdAndDelete(req.params.id);
        if (!deletedFranchise) {
            return res.status(404).json({ message: 'Franchise not found' });
        }
        res.json({ message: 'Franchise deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting franchise', error: err.message });
    }
});

// Search franchises
app.get('/api/franchises/search/:term', async (req, res) => {
    try {
        const searchTerm = req.params.term;
        const franchises = await Franchise.find({
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { company: { $regex: searchTerm, $options: 'i' } },
                { contactName: { $regex: searchTerm, $options: 'i' } },
                { contactEmail: { $regex: searchTerm, $options: 'i' } },
                { contactPhone: { $regex: searchTerm, $options: 'i' } }
            ]
        });
        res.json(franchises);
    } catch (err) {
        res.status(500).json({ message: 'Error searching franchises', error: err.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});