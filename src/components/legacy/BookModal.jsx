import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const BookModal = ({ story, isOpen, onClose }) => {
    const [pageIndex, setPageIndex] = useState(0);

    // Reset to cover on open
    useEffect(() => {
        if (isOpen) setPageIndex(0);
    }, [isOpen, story]);

    // Safety checks
    if (!isOpen || !story) return null;
    const chapters = story.chapters || [];
    const totalPages = chapters.length + 1; // 0=Cover, 1..N=Chapters

    // URL helper
    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        return `http://localhost:8000${url}`;
    };

    const nextPage = (e) => {
        e?.stopPropagation();
        if (pageIndex < totalPages - 1) setPageIndex(prev => prev + 1);
    };

    const prevPage = (e) => {
        e?.stopPropagation();
        if (pageIndex > 0) setPageIndex(prev => prev - 1);
    };

    // Keyboard support - unconditional hooks
    useEffect(() => {
        if (!isOpen) return;
        const handleKeys = (e) => {
            if (e.key === 'ArrowRight') nextPage();
            if (e.key === 'ArrowLeft') prevPage();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [isOpen, pageIndex, totalPages]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f0f0f] animate-fadeIn font-serif text-[#333]">

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Lora:ital,wght@0,400;1,400&display=swap');
                
                .book-container {
                    /* Responsive Fullscreen Logic */
                    width: 95vw;
                    height: 59vw; /* ~16:10 Aspect Ratio */
                    max-height: 95vh;
                    max-width: 152vh; /* Corresponding width for max-height based on AR */
                    
                    background: #f4ecd8; 
                    border-radius: 4px; 
                    box-shadow: 0 50px 100px rgba(0,0,0,0.9); 
                    position: relative; 
                    overflow: hidden;
                    display: flex;
                    transition: transform 0.3s ease;
                }

                .page-layout {
                    width: 100%;
                    height: 100%;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                }

                 /* Click Zones for Navigation */
                .click-zone {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 50%;
                    z-index: 10;
                    cursor: pointer;
                    opacity: 0;
                    transition: background 0.2s;
                }
                .click-zone:hover {
                    background: rgba(0,0,0,0.02); /* Slight feedback */
                }
                .click-zone.prev { left: 0; }
                .click-zone.next { right: 0; }
                
                /* Layout Internals */
                .cover-layout {
                    grid-template-columns: 1fr !important;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }
                .left-side {
                    padding: 4rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    border-right: 1px solid rgba(0,0,0,0.1);
                    text-align: left;
                    overflow-y: auto; /* Allow scroll if text is huge */
                }
                /* Custom Scrollbar */
                .left-side::-webkit-scrollbar { width: 6px; }
                .left-side::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 3px; }

                .right-side {
                    background: #000;
                    overflow: hidden;
                }
                .right-side img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .part-num {
                    font-family: 'Cinzel', serif;
                    color: #d35400;
                    margin-bottom: 1rem;
                    font-weight: bold;
                    font-size: 1.2rem;
                }
                .story-text {
                    font-family: 'Lora', serif;
                    font-size: 1.15rem; /* Slightly larger for reading */
                    line-height: 1.8;
                    text-align: justify;
                    color: #2c2c2c;
                }
                .story-text::first-letter {
                    font-size: 3rem;
                    float: left;
                    margin-right: 8px;
                    color: #d35400;
                    font-family: 'Cinzel', serif;
                    line-height: 1;
                }
                .image-prompt {
                    font-size: 0.75rem;
                    color: #999;
                    margin-top: 2rem;
                    font-style: italic;
                    opacity: 0.7;
                }
                .cover-title {
                    font-family: 'Cinzel', serif;
                    font-size: 4vw; /* Responsive font */
                    color: #d35400;
                    margin-bottom: 2rem;
                    text-transform: uppercase;
                    letter-spacing: 4px;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .cover-img-container {
                    width: 70%;
                    height: 50%;
                    overflow: hidden;
                    border-radius: 4px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                    border: 1px solid rgba(0,0,0,0.1);
                }
                .cover-img-container img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            `}</style>

            {/* Close Button - Hidden by default, shows on hover over top-right area */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-3 text-white/30 hover:text-white bg-black/0 hover:bg-black/50 rounded-full transition-all z-[60]"
                title="Fechar (Esc)"
            >
                <X size={24} />
            </button>

            {/* Main Book Container */}
            <div className="book-container">

                {/* Invisible Click Navigation Zones */}
                {pageIndex > 0 && <div className="click-zone prev" onClick={prevPage} title="Anterior" />}
                {pageIndex < totalPages - 1 && <div className="click-zone next" onClick={nextPage} title="Próximo" />}

                {/* COVER PAGE (Index 0) */}
                {pageIndex === 0 && (
                    <div className="page-layout cover-layout animate-fadeIn">
                        {/* Cover also allows clicking anywhere to start */}
                        <div className="absolute inset-0 z-20 cursor-pointer" onClick={nextPage} title="Iniciar Leitura" />

                        <div className="cover-title">{story.title}</div>
                        <div className="cover-img-container">
                            <img src={getImageUrl(story.cover_image || story.cover)} alt="Capa" />
                        </div>
                        <div style={{ marginTop: '3rem', fontFamily: 'Cinzel', fontSize: '1.2rem', color: '#666', letterSpacing: '2px' }}>
                            {story.nome ? `A JORNADA DE ${story.nome.toUpperCase()}` : "SUA AVENTURA IMAGINÁRIA"}
                        </div>
                        <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#999' }}>
                            (Clique para iniciar)
                        </div>
                    </div>
                )}

                {/* CHAPTER PAGES (Index 1..N) */}
                {pageIndex > 0 && (
                    <div className="page-layout animate-fadeIn">
                        {/* Left: Text */}
                        <div className="left-side">
                            <div className="part-num">Capítulo {pageIndex}</div>
                            <div className="story-text">
                                {chapters[pageIndex - 1].text}
                            </div>
                            {/* Optional: Show prompt only on hover or keep it subtle */}
                            <div className="image-prompt">
                                {chapters[pageIndex - 1].prompt?.slice(0, 100)}...
                            </div>
                        </div>

                        {/* Right: Image */}
                        <div className="right-side">
                            <img
                                src={getImageUrl(chapters[pageIndex - 1].image || chapters[pageIndex - 1].image_url)}
                                alt={`Capítulo ${pageIndex}`}
                            />
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default BookModal;
