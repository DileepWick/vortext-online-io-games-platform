import React, { useEffect, useRef } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css'; // Import Plyr CSS

const VideoPlayer = ({ videoUrl }) => {
    const playerRef = useRef(null);
  
    useEffect(() => {
      if (playerRef.current) {
        const player = new Plyr(playerRef.current);
        return () => {
          player.destroy();
        };
      }
    }, []);
  
    return (
      <div>
        <video ref={playerRef} controls>
          <source src={videoUrl} type="video/mp4" />
        </video>
      </div>
    );
  };
  
  export default VideoPlayer;
  