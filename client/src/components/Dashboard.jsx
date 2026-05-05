import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { statesData } from '../data';
import CityView from './CityView';

const Dashboard = ({ auth, setAuth }) => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState(null);
  
  // State for fetched Wikipedia data
  const [extract, setExtract] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!auth) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    setAuth(null);
    navigate('/');
  };

  const stateData = statesData.find(s => s.name === auth.state);

  useEffect(() => {
    let isMounted = true;
    if (stateData) {
      const fetchStateData = async () => {
        setLoading(true);
        setImages([]);
        setExtract('');
        try {
          // Fetch text extract
          const textRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&origin=*&titles=${encodeURIComponent(stateData.name)}&prop=extracts&exintro&explaintext&format=json`);
          const textData = await textRes.json();
          const pages = textData.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pages[pageId]?.extract) {
            if (isMounted) setExtract(pages[pageId].extract);
          } else {
            if (isMounted) setExtract(stateData.detailedExplanation); // fallback
          }

          // Fetch images list
          const imgRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&origin=*&titles=${encodeURIComponent(stateData.name)}&prop=images&imlimit=20&format=json`);
          const imgData = await imgRes.json();
          const imgPages = imgData.query.pages;
          const imgPageId = Object.keys(imgPages)[0];
          
          let fileTitles = [];
          if (imgPages[imgPageId]?.images) {
            // Filter out svgs, icons, flags, locators
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
          console.error("Failed to fetch state data", error);
        } finally {
          if (isMounted) setLoading(false);
        }
      };
      fetchStateData();
    }
    return () => { isMounted = false; };
  }, [stateData]);

  if (selectedCity) {
    return <CityView cityName={selectedCity} onBack={() => setSelectedCity(null)} />;
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">India States Explorer</div>
        <div className="user-info">
          <span className="user-greeting">Hello, {auth.username}</span>
          {stateData && (
            <div className="nav-dropdown">
              <span className="nav-dropdown-title">Explore Cities <span style={{fontSize:'0.8em'}}>&#9660;</span></span>
              <div className="nav-dropdown-content">
                {stateData.cities.map((city, idx) => (
                  <div key={idx} className="nav-dropdown-item" onClick={() => setSelectedCity(city)}>
                    {city}
                  </div>
                ))}
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </nav>

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

      <main className="container dashboard-container fade-in" style={{ zIndex: 1, position: 'relative' }}>
        <div className="dashboard-header text-center slide-down">
          <h1>Your Personalized Dashboard</h1>
          <p>Exploring the beauty and culture of {auth.state}</p>
        </div>

        {stateData ? (
          <>
            <section className="glass-panel city-detail-panel slide-up-delay mb-4">
              <h2 className="city-title">{stateData.name}</h2>
              <div className="state-stats mb-4">
                <div className="stat-item">
                  <span className="stat-label">Capital City</span>
                  <span className="stat-value" style={{ color: 'var(--primary)' }}>{stateData.capital}</span>
                </div>
              </div>
              <p className="state-desc" style={{ marginBottom: '2rem', fontSize: '1.2rem', fontWeight: 500 }}>
                {stateData.description}
              </p>

              {loading ? (
                <div className="loading-container">
                  <button className="btn btn-primary loading-btn" disabled>
                    <div className="spinner-ring"></div>
                    Fetching State Data...
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
                    <div className="city-gallery mb-4">
                      <h3>Gallery</h3>
                      <div className="gallery-grid">
                        {images.map((url, idx) => (
                          <img key={idx} src={url} alt={`${stateData.name} view ${idx}`} className="gallery-img floating" style={{ animationDelay: `${idx * 0.3}s` }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>


          </>
        ) : (
          <div className="glass-panel text-center">
            <h2>State data not found</h2>
            <p>We couldn't find data for your selected state: {auth.state}</p>
          </div>
        )}
      </main>
    </>
  );
};

export default Dashboard;
