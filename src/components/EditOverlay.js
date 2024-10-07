import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EditOverlay = ({ overlay, onClose, onUpdate }) => {
  // Set initial state for content, width, and height
  const [content, setContent] = useState(overlay.content || '');
  const [width, setWidth] = useState(overlay.size?.width || 100); // Default width
  const [height, setHeight] = useState(overlay.size?.height || 100); // Default height

  // Update local state when the overlay prop changes
  useEffect(() => {
    setContent(overlay.content || '');
    setWidth(overlay.size?.width || 100);
    setHeight(overlay.size?.height || 100);
  }, [overlay]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const updatedOverlayData = {
      ...overlay,
      content,
      size: { width: parseInt(width), height: parseInt(height) }, // Include size in the update
    };
  
    try {
      await axios.put(`http://localhost:5000/api/overlays/${overlay._id}`, updatedOverlayData);
      onUpdate(updatedOverlayData); // Pass the updated overlay to the parent
      onClose(); // Close the modal after updating
    } catch (error) {
      console.error('Error updating overlay:', error.response ? error.response.data : error.message);
    }
  };
  

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Edit Overlay</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Content:
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </label>
          <label>
            Width:
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              required
              min="1" // Ensure width is at least 1
            />
          </label>
          <label>
            Height:
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              required
              min="1" // Ensure height is at least 1
            />
          </label>
          <button type="submit">Update</button>
        </form>
      </div>
    </div>
  );
};

export default EditOverlay;
