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
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-marigold selection:text-black">
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950 z-10" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-10 scale-110">
          {images.map((imgUrl, i) => (
            <div 
              key={i} 
              className="h-[60vh] bg-cover bg-center rounded-3xl grayscale" 
              style={{ 
                backgroundImage: `url(${imgUrl})`,
                animation: `pulseBg 20s infinite alternate ${i * 2}s`
              }} 
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        <button 
          className="group mb-12 flex items-center gap-3 px-8 py-3 bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 rounded-full text-slate-400 hover:text-amber-500 font-bold transition-all duration-300" 
          onClick={onBack}
        >
          <span className="text-xl transition-transform group-hover:-translate-x-2">←</span> 
          <span className="tracking-widest text-xs uppercase">Return to State</span>
        </button>

        <div className="space-y-24 animate-fade-in">
          {/* City Hero */}
          <div className="text-center space-y-4">
            <span className="text-amber-500 font-black tracking-[0.5em] uppercase text-sm block animate-tracking-in-expand">
              Exploring Urban Heritage
            </span>
            <h1 className="text-7xl md:text-[10rem] font-serif font-black leading-tight bg-gradient-to-b from-white via-white to-amber-500/20 bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              {cityName}
            </h1>
          </div>

          <div className="grid lg:grid-cols-5 gap-20 items-start">
            <div className="lg:col-span-3 space-y-12">
              <section className="glass-panel p-10 md:p-16 rounded-[3rem] bg-slate-900/40 backdrop-blur-3xl border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.4)]">
                {loading ? (
                  <div className="space-y-6 py-10 animate-pulse">
                    <div className="h-6 bg-white/5 rounded-full w-full" />
                    <div className="h-6 bg-white/5 rounded-full w-5/6" />
                    <div className="h-6 bg-white/5 rounded-full w-3/4" />
                  </div>
                ) : (
                  <div className="space-y-10">
                    <div className="prose prose-invert max-w-none prose-p:text-xl prose-p:leading-relaxed prose-p:text-slate-300 prose-p:font-light">
                      {extract.split('\n').map((paragraph, idx) => (
                        <p key={idx} className="mb-8">{paragraph}</p>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>

            <div className="lg:col-span-2 sticky top-32 space-y-8">
              <div className="p-1 bg-gradient-to-br from-amber-500/40 to-emerald-500/40 rounded-[2.5rem] shadow-2xl">
                <div className="bg-slate-950 p-10 rounded-[2.4rem] space-y-8">
                  <div className="h-px w-12 bg-amber-500" />
                  <h4 className="text-3xl font-serif font-bold text-white">City Essentials</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    A deep dive into the historical significance and modern-day charm of {cityName}.
                  </p>
                  <div className="pt-4 flex items-center gap-4 text-amber-500 font-black tracking-widest text-xs uppercase italic">
                    <span className="w-8 h-[1px] bg-amber-500/30" /> Real-time Discovery
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cinematic Gallery */}
          {!loading && images.length > 0 && (
            <section className="space-y-16">
              <div className="flex items-center gap-8">
                <h3 className="text-5xl font-serif font-black text-white whitespace-nowrap">Gallery</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {images.map((url, idx) => (
                  <div key={idx} className="group relative aspect-[3/4] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <img src={url} alt="" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                    <div className="absolute top-6 left-6 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-[10px] font-bold text-amber-500 border border-white/20">
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default CityView;
