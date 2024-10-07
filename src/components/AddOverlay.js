import React, { useState } from 'react';
import axios from 'axios';
import '../App.css'; // Import the CSS file for styling

const AddOverlay = ({ setOverlays, overlays }) => {
  const [content, setContent] = useState('');
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const [image, setImage] = useState(null); // State for the selected image

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(); // Create a FormData object
    if (content) {
      formData.append('content', content); // Only add content if it exists
    }
    formData.append('width', width);
    formData.append('height', height);
    if (image) {
      formData.append('image', image); // Append the image file if it exists
    }

    try {
      const response = await axios.post('http://15.207.100.237:5000/api/overlays', formData);
      console.log(response.data);

      // Update the overlays list in the parent component
      setOverlays([...overlays, response.data]); // Add the new overlay to the list
    } catch (error) {
      console.error('Error adding overlay:', error);
    }

    // Reset form
    setContent('');
    setWidth(100);
    setHeight(100);
    setImage(null); // Reset image
  };

  return (
    <form onSubmit={handleSubmit} className="add-overlay-form" encType="multipart/form-data">
      <input
        type="text"
        placeholder="Overlay content (optional)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="add-overlay-input"
      />
      <input
        type="number"
        placeholder="Width"
        value={width}
        onChange={(e) => setWidth(e.target.value)}
        required
        className="add-overlay-input"
      />
      <input
        type="number"
        placeholder="Height"
        value={height}
        onChange={(e) => setHeight(e.target.value)}
        required
        className="add-overlay-input"
      />
<input
  type="file"
  accept=".png, .jpg, .jpeg" // Accept only image files
  onChange={(e) => {
    const file = e.target.files[0];
    setImage(file);
    console.log('Selected file:', file); // Log the selected file
  }}
  className="add-overlay-input"
/>

      <button type="submit" className="add-overlay-button">Add Overlay</button>
    </form>
  );
};

export default AddOverlay;
