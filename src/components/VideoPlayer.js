import React from 'react';

const VideoPlayer = () => {
  return (
    <div>
      <iframe 
        width="640" 
        height="480" 
        src="https://rtsp.me/embed/hQZz7DsK/" 
        frameBorder="0" 
        allowFullScreen
        title="Livestream Video"
      ></iframe>
    </div>
  );
};

export default VideoPlayer;
