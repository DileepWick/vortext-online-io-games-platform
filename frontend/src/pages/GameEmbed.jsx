// src/components/GameEmbed.js
import React from 'react';

const GameEmbed = ({ src, title }) => (
  <div className="game-container">
    <h2 className='text-lg'>{title}</h2>
    <iframe
      src={src}
      title={title}
      width="100%"
      height="600px"
      frameBorder="0"
      allowFullScreen
    ></iframe>
  </div>
);

export default GameEmbed;
