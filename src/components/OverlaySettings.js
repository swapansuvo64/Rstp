import React from 'react';

const Overlay = ({ content, position, size }) => {
  const style = {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${size.width}px`,
    height: `${size.height}px`,
    background: 'rgba(255,255,255,0.5)',
  };
  return <div style={style}>{content}</div>;
};

export default Overlay;
