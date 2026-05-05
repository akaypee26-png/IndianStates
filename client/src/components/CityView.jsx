import React, { useState, useEffect } from 'react';

const CityView = ({ cityName, onBack }) => {
  const [extract, setExtract] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCityData = async () => {
      setLoading(true);
      setImages([]);
      setExtract('');
      try {
        // Fetch text extract
        const textRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&origin=*&titles=${encodeURIComponent(cityName)}&prop=extracts&exintro&explaintext&format=json`);
        const textData = await textRes.json();
        const pages = textData.query.pages;
        const pageId = Object.keys(pages)[0];
        if (pages[pageId]?.extract) {
          if (isMounted) setExtract(pages[pageId].extract);
        } else {
          if (isMounted) setExtract(`We couldn't find detailed information for ${cityName}.`);
        }

        // Fetch images list
        const imgRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&origin=*&titles=${encodeURIComponent(cityName)}&prop=images&imlimit=20&format=json`);
        const imgData = await imgRes.json();
        const imgPages = imgData.query.pages;
        const imgPageId = Object.keys(imgPages)[0];
        
        let fileTitles = [];
        if (imgPages[imgPageId]?.images) {
          // Filter out svgs, icons, flags
          const validFiles = imgPages[imgPageId].images.filter(img => 
            !img.title.toLowerCase().endsWith('.svg') && 
            !img.title.toLowerCase().includes('icon') &&
            !img.title.toLowerCase().includes('map') &&
            !img.title.toLowerCase().includes('flag') &&
            !img.title.toLowerCase().includes('locator')
          ).slice(0, 7);
          
          fileTitles = validFiles.map(img => img.title);
        }

        if (fileTitles.length > 0) {
          // Fetch actual URLs for these images
          const urlRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&origin=*&titles=${encodeURIComponent(fileTitles.join('|'))}&prop=imageinfo&iiprop=url&format=json`);
          const urlData = await urlRes.json();
          const urlPages = urlData.query.pages;
          
          const imageUrls = Object.values(urlPages)
            .map(p => p.imageinfo && p.imageinfo[0]?.url)
            .filter(Boolean);
            
          if (isMounted) setImages(imageUrls);
        }

      } catch (error) {
        console.error("Failed to fetch city data", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCityData();
    return () => { isMounted = false; };
  }, [cityName]);

  return (
    <div className="city-view-container fade-in">
      {/* Background Collage */}
      <div className="city-bg-collage">
        {images.map((imgUrl, i) => (
          <div 
            key={i} 
            className="collage-image" 
            style={{ 
              backgroundImage: `url(${imgUrl})`,
              animationDelay: `${i * 0.5}s`
            }} 
          />
        ))}
      </div>

      <div className="city-content-overlay">
        <button className="btn btn-secondary mb-4 back-btn" onClick={onBack}>
          &larr; Back to State
        </button>

        <div className="glass-panel city-detail-panel slide-up-fast">
          <h1 className="city-title">{cityName}</h1>
          
          {loading ? (
            <div className="loading-container">
              <button className="btn btn-primary loading-btn" disabled>
                <div className="spinner-ring"></div>
                Fetching City Data...
              </button>
            </div>
          ) : (
            <div className="city-info">
              <div className="city-extract">
                {extract.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4">{paragraph}</p>
                ))}
              </div>
              
              {images.length > 0 && (
                <div className="city-gallery">
                  <h3>Gallery</h3>
                  <div className="gallery-grid">
                    {images.map((url, idx) => (
                      <img key={idx} src={url} alt={`${cityName} view ${idx}`} className="gallery-img floating" style={{ animationDelay: `${idx * 0.3}s` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CityView;
