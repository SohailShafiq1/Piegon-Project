import React, { useState, useEffect } from 'react';
import '../styles/Banner.css';
import img1 from '../assets/img1.jpg';
import img2 from '../assets/img2.jpg';

const Banner = ({ posters }) => {
  const defaultImages = [img1, img2];
  const images = (posters && posters.length > 0) ? posters : defaultImages;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset index when images change (e.g. switching tournaments)
    setCurrentIndex(0);
  }, [images.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="banner">
      <div className="banner-content">
        <img src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} className="banner-image" />
        <div className="overlay-controls">
          <span className="arrow prev" onClick={() => setCurrentIndex((currentIndex - 1 + images.length) % images.length)}>&lt;</span>
          <div className="dots">
            {images.map((_, index) => (
              <span 
                key={index} 
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
              ></span>
            ))}
          </div>
          <span className="arrow next" onClick={() => setCurrentIndex((currentIndex + 1) % images.length)}>&gt;</span>
        </div>
      </div>
    </div>
  );
};

export default Banner;
