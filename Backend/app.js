const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import fs for file system operations

const app = express();
app.use(cors());
app.use(express.json());

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Use the uploads directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Create unique filename
  },
});

const upload = multer({ storage });


// MongoDB connection
const mongoURI = 'mongodb+srv://Roni:3JT0brptvrBKtIQW@cluster0.kardea6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error: ', err));

// Overlay Schema and Model
const OverlaySchema = new mongoose.Schema({
  content: { type: String, required: true },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
  },
  size: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  imageUrl: { type: String }, // Field for storing image URL
});

const Overlay = mongoose.model('Overlay', OverlaySchema);

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadsDir));

// API Routes

// Fetch all overlays
app.get('/api/overlays', async (req, res) => {
  try {
    const overlays = await Overlay.find();
    // Transform the overlays to a simpler structure
    const transformedOverlays = overlays.map(overlay => ({
      _id: overlay._id,
      content: overlay.content,
      position: {
        x: overlay.position.x,
        y: overlay.position.y,
      },
      size: {
        width: overlay.size.width,
        height: overlay.size.height,
      },
      imageUrl: overlay.imageUrl, // Include image URL in response
    }));
    res.json(transformedOverlays);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching overlays', error });
  }
});

// Create a new overlay with an image
// Create a new overlay with an image
app.post('/api/overlays', upload.single('image'), async (req, res) => {
  console.log('Received file:', req.file); // Log the received file
  console.log('Request body:', req.body); // Log the request body

  try {
    const overlay = new Overlay({
      content: req.body.content,
      position: { x: 0, y: 0 },
      size: {
        width: Number(req.body.width),
        height: Number(req.body.height),
      },
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null, // Store the image URL
    });
    const savedOverlay = await overlay.save();
    res.status(201).json(savedOverlay); // Return the saved overlay
  } catch (error) {
    console.error('Error adding overlay:', error);
    res.status(500).json({ message: 'Error adding overlay', error });
  }
});


// Update an existing overlay
app.put('/api/overlays/:id', async (req, res) => {
  const overlayId = req.params.id;
  const { content, position, size, imageUrl } = req.body; // Include content and size

  try {
    const updatedOverlay = await Overlay.findByIdAndUpdate(
      overlayId,
      { content, position, size, imageUrl }, // Update all properties
      { new: true }
    );
    if (!updatedOverlay) {
      return res.status(404).send('Overlay not found');
    }
    res.send(updatedOverlay);
  } catch (error) {
    console.error('Error updating overlay:', error);
    res.status(500).send('Server error');
  }
});

// Delete an overlay
app.delete('/api/overlays/:id', async (req, res) => {
  const overlayId = req.params.id;
  console.log(`Received request to delete overlay with ID: ${overlayId}`); // Log ID

  try {
    const result = await Overlay.findByIdAndDelete(overlayId);

    if (!result) {
      return res.status(404).send({ message: "Overlay not found" });
    }

    res.send({ message: "Overlay deleted successfully" });
  } catch (error) {
    console.error('Error deleting overlay:', error);
    res.status(500).send({ message: "Error deleting overlay", error });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
