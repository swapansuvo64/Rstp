import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Draggable from 'react-draggable';
import AddOverlay from './components/AddOverlay';
import EditOverlay from './components/EditOverlay'; // Import the EditOverlay component
import './App.css'; // Import CSS for styling

const App = () => {
  const [overlays, setOverlays] = useState([]);
  const [rtspLink, setRtspLink] = useState('https://rtsp.me/embed/hQZz7DsK/'); // Default RTSP link
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentOverlay, setCurrentOverlay] = useState(null);

  // Define the iframe dimensions
  const iframeWidth = 960; // Width of the iframe
  const iframeHeight = 480; // Height of the iframe

  // Fetch all overlays
  useEffect(() => {
    const fetchOverlays = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/overlays');
        setOverlays(response.data);
      } catch (error) {
        console.error('Error fetching overlays:', error);
      }
    };
    fetchOverlays();
  }, []);

  // Delete an overlay
  const handleDelete = async (id) => {
    console.log(`Attempting to delete overlay with ID: ${id}`);

    if (!id) {
      console.error('No ID provided for deletion');
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/overlays/${id}`);
      console.log(`Overlay with ID ${id} deleted successfully`);
      setOverlays((prevOverlays) => prevOverlays.filter(overlay => overlay._id !== id));
    } catch (error) {
      console.error('Error deleting overlay:', error);
    }
  };

  // Handle drag stop to update overlay position
  const handleStop = async (e, data, overlay) => {
    const updatedPosition = {
      x: Math.max(0, Math.min(data.x, iframeWidth - overlay.size.width)),
      y: Math.max(0, Math.min(data.y, iframeHeight - overlay.size.height)),
    };

    const updatedOverlayData = {
      ...overlay,
      position: updatedPosition,
    };

    console.log('Updating overlay position with data:', updatedOverlayData);

    try {
      await axios.put(`http://localhost:5000/api/overlays/${overlay._id}`, updatedOverlayData);
      console.log('Overlay position updated successfully:', updatedOverlayData);
      setOverlays((prevOverlays) =>
        prevOverlays.map(o => (o._id === overlay._id ? updatedOverlayData : o))
      );
    } catch (error) {
      console.error('Error updating overlay position:', error.response ? error.response.data : error.message);
    }
  };

  // Open edit modal with overlay data
  const openEditModal = (overlay) => {
    setCurrentOverlay(overlay);
    setIsEditModalOpen(true);
  };

  // Handle updated overlay data from EditOverlay component
  const handleUpdateOverlay = (updatedOverlay) => {
    setOverlays((prevOverlays) =>
      prevOverlays.map(o => (o._id === updatedOverlay._id ? updatedOverlay : o))
    );
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Livestream App</h1>
      <h3 className="app-title">Drag mouse to move Overlay</h3>

      <div className="rtsp-input-container">
        <label htmlFor="rtspInput" className="rtsp-label">RTSP Link:</label>
        <input
          id="rtspInput"
          type="text"
          value={rtspLink}
          onChange={(e) => setRtspLink(e.target.value)}
          className="rtsp-input"
        />
      </div>

      <div className="livestream-container">
        <iframe
          width="960"
          height="480"
          src={rtspLink}
          frameBorder="0"
          allowFullScreen
          className="livestream-iframe"
        ></iframe>

        {overlays.map((overlay) => {
          const position = overlay.position || { x: 0, y: 0 };
          const size = overlay.size || { width: 100, height: 100 };
          const content = overlay.content || '';
          const imageUrl = overlay.imageUrl; // Get the image URL from overlay

          return (
            <Draggable
              key={overlay._id}
              position={{ x: position.x, y: position.y }}
              onStop={(e, data) => handleStop(e, data, overlay)}
              bounds={{
                left: 0,
                top: 0,
                right: iframeWidth - size.width,
                bottom: iframeHeight - size.height,
              }}
            >
              <div
                className="overlay"
                style={{
                  width: `${size.width}px`,
                  height: `${size.height}px`,
                  position: 'absolute', // Ensure it's positioned correctly
                  zIndex: 1,
                }}
              >
                {imageUrl ? (
                  <img 
  src={`http://localhost:5000${imageUrl}`} // Prepend the base URL
  alt="Overlay" 
  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
/>

                ) : (
                  <span>{content}</span>
                )}
              </div>
            </Draggable>
          );
        })}
      </div>

      <AddOverlay setOverlays={setOverlays} overlays={overlays} />
      <OverlayList overlays={overlays} handleDelete={handleDelete} openEditModal={openEditModal} />

      {isEditModalOpen && currentOverlay && (
        <EditOverlay
          overlay={currentOverlay}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateOverlay}
        />
      )}
    </div>
  );
};

// Overlay List Component
const OverlayList = ({ overlays, handleDelete, openEditModal }) => {
  return (
    <div className="overlay-list-container">
      <h2 className="overlay-list-title">Overlay List</h2>
      <ul className="overlay-list">
        {overlays.map(overlay => (
          <li key={overlay._id} className="overlay-list-item">
            <span>
              <strong>Content:</strong> {overlay.content} &nbsp;
              <strong>Image URL:</strong> <a href={overlay.imageUrl} target="_blank" rel="noopener noreferrer">{overlay.imageUrl}</a> &nbsp; 
              <strong>Position:</strong> ({overlay.position?.x || 0}, {overlay.position?.y || 0}) &nbsp;
              <strong>Size:</strong> {overlay.size?.width || 100}x{overlay.size?.height || 100}
            </span>
            <button 
              onClick={() => handleDelete(overlay._id)} 
              className="delete-button"
            >
              Delete
            </button>
            <button 
              onClick={() => openEditModal(overlay)} 
              className="edit-button"
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
