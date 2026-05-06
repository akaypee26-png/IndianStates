import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { statesData } from '../data';
import CityView from './CityView';

const Dashboard = ({ auth, setAuth }) => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState(null);
  const [viewedState, setViewedState] = useState(auth ? auth.state : '');
  
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

  const stateData = statesData.find(s => s.name === viewedState);

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
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-marigold selection:text-black">
      {/* Immersive Navbar */}
      <nav className="navbar fixed top-0 w-full z-[9999] bg-slate-950/60 backdrop-blur-2xl border-b border-amber-500/20 px-8 py-5 flex justify-between items-center shadow-[0_10px_50px_rgba(0,0,0,0.5)]">
        <div className="navbar-brand text-3xl font-serif font-black tracking-tighter bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">
          India Tourism
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden lg:flex items-center gap-2 text-slate-400 font-medium tracking-wide">
            EXPLORING <span className="text-amber-500 font-bold ml-1">{viewedState.toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Explore States Dropdown */}
            <div className="group relative">
              <button className="px-6 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-500 font-bold transition-all duration-300 flex items-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                EXPLORE STATES <span className="text-[10px] transition-transform group-hover:rotate-180">▼</span>
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-slate-950/95 backdrop-blur-3xl border border-amber-500/40 rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.8)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 z-[10000] py-3 overflow-y-auto max-h-[70vh]">
                {statesData.map((s, idx) => (
                  <div key={idx} className="px-6 py-3.5 hover:bg-amber-500/20 hover:text-white transition-colors cursor-pointer font-semibold border-b border-white/5 last:border-0" onClick={() => { setViewedState(s.name); setSelectedCity(null); }}>
                    {s.name}
                  </div>
                ))}
              </div>
            </div>

            {stateData && (
              <div className="group relative">
                <button className="px-6 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 font-bold transition-all duration-300 flex items-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                  POPULAR CITIES <span className="text-[10px] transition-transform group-hover:rotate-180">▼</span>
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-slate-950/95 backdrop-blur-3xl border border-emerald-500/40 rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.8)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 z-[10000] py-3 overflow-y-auto max-h-[70vh]">
                  {stateData.cities.map((city, idx) => (
                    <div key={idx} className="px-6 py-3.5 hover:bg-emerald-500/20 hover:text-white transition-colors cursor-pointer font-semibold border-b border-white/5 last:border-0" onClick={() => setSelectedCity(city)}>
                      {city}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-rose-500/20 border border-white/10 text-slate-400 hover:text-rose-400 transition-all duration-300" title="Logout">
              ✕
            </button>
          </div>
        </div>
      </nav>

      {selectedCity ? (
        <CityView cityName={selectedCity} onBack={() => setSelectedCity(null)} />
      ) : (
        <div className="relative pt-24 pb-20">
          {/* Majestic Dynamic Background */}
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950 z-10" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-20 scale-110">
              {images.map((imgUrl, i) => (
                <div 
                  key={i} 
                  className="h-[60vh] bg-cover bg-center rounded-3xl" 
                  style={{ 
                    backgroundImage: `url(${imgUrl})`,
                    animation: `pulseBg 20s infinite alternate ${i * 2}s`
                  }} 
                />
              ))}
            </div>
          </div>

          <main className="container mx-auto px-6 relative z-10">
            {/* Grand Hero Section */}
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
              <div className="space-y-2">
                <span className="text-amber-500 font-black tracking-[0.5em] uppercase text-sm block mb-4 animate-tracking-in-expand">
                  Discover the Heart of India
                </span>
                <h1 className="text-7xl md:text-[10rem] font-serif font-black leading-tight bg-gradient-to-b from-white via-white to-amber-500/20 bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  {stateData?.name}
                </h1>
              </div>
              
              <div className="max-w-3xl glass-panel p-8 md:p-12 rounded-[3rem] bg-slate-900/40 backdrop-blur-3xl border border-amber-500/20 shadow-[0_0_100px_rgba(0,0,0,0.4)] animate-slide-up-grand">
                <h2 className="text-3xl font-serif italic text-amber-200 mb-6 font-bold">
                  "Welcome to your {stateData?.name}"
                </h2>
                <p className="text-xl text-slate-300 leading-relaxed font-light">
                  {stateData?.description}
                </p>
                <div className="mt-10 flex justify-center gap-12 border-t border-white/10 pt-8">
                  <div className="text-center">
                    <div className="text-amber-500 font-black text-2xl uppercase tracking-tighter">{stateData?.capital}</div>
                    <div className="text-[10px] text-slate-500 font-bold tracking-widest mt-1">CAPITAL CITY</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Depth Section */}
            {stateData && (
              <div className="mt-32 space-y-32">
                <section className="grid lg:grid-cols-5 gap-20 items-start">
                  <div className="lg:col-span-3 space-y-12">
                    <div className="relative">
                      <div className="absolute -left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-transparent opacity-30" />
                      <h3 className="text-4xl font-serif font-black mb-8 text-white">Historical Heritage & Insights</h3>
                      <div className="space-y-8 text-lg leading-loose text-slate-400 font-normal">
                        {loading ? (
                          <div className="flex flex-col gap-4 animate-pulse">
                            <div className="h-4 bg-white/5 rounded-full w-full" />
                            <div className="h-4 bg-white/5 rounded-full w-3/4" />
                            <div className="h-4 bg-white/5 rounded-full w-5/6" />
                          </div>
                        ) : (
                          extract.split('\n').map((paragraph, idx) => (
                            <p key={idx}>{paragraph}</p>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 sticky top-32 space-y-8">
                    <div className="p-1 bg-gradient-to-br from-amber-500/40 to-emerald-500/40 rounded-[2.5rem] shadow-2xl">
                      <div className="bg-slate-950 p-8 rounded-[2.4rem] space-y-6">
                        <h4 className="text-2xl font-serif font-bold text-amber-500">Quick Facts</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-3 border-b border-white/5">
                            <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Official Capital</span>
                            <span className="text-white font-bold">{stateData.capital}</span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b border-white/5">
                            <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Major Hubs</span>
                            <span className="text-white font-bold">{stateData.cities.length} Cities</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Majestic Gallery Grid */}
                {!loading && images.length > 0 && (
                  <section className="space-y-16">
                    <div className="text-center space-y-4">
                      <h3 className="text-5xl font-serif font-black text-white">Visual Tapestry</h3>
                      <p className="text-slate-500 uppercase tracking-[0.3em] text-xs font-bold">Immersive glimpses of {stateData.name}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {images.map((url, idx) => (
                        <div key={idx} className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl bg-slate-900 cursor-pointer">
                          <img src={url} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-90" />
                          <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-4 group-hover:translate-y-0 transition-transform">
                            <div className="h-px w-12 bg-amber-500 mb-4" />
                            <div className="text-amber-500 font-black text-xs tracking-widest uppercase mb-1">CULTURAL SNAPSHOT</div>
                            <div className="text-2xl font-serif font-bold text-white">Explore {stateData.name}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
