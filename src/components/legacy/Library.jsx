import React, { useEffect, useState } from 'react';
import { Book, Trash2, Globe, ExternalLink } from 'lucide-react';

const Library = ({ onOpenStory }) => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/stories');
            const data = await res.json();
            setStories(data);
        } catch (error) {
            console.error("Failed to load library", error);
        } finally {
            setLoading(false);
        }
    };

    const loadStoryDetails = async (id) => {
        try {
            // Fetch full details to play in the app
            const res = await fetch(`http://localhost:8000/api/stories/${id}`);
            const data = await res.json();
            onOpenStory(data);
        } catch (e) {
            console.error("Error loading story", e);
        }
    };

    // Helper to open the standalone site
    const openStandaloneSite = (id) => {
        // The backend serves it at /stories/{id}/index.html
        // We open it in a new tab
        window.open(`http://localhost:8000/stories/${id}/index.html`, '_blank');
    };

    if (loading) return <div className="text-white text-center p-10">Carregando sua biblioteca...</div>;

    return (
        <div className="w-full max-w-7xl mx-auto p-8 animate-fadeIn">
            <div className="flex items-center gap-4 mb-10">
                <Book className="text-pink-500" size={32} />
                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                    Minha Biblioteca
                </h2>
            </div>

            {stories.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <p className="text-slate-400 text-xl">Nenhuma história salva ainda. Crie a primeira!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {stories.map((story) => (
                        <div
                            key={story.id}
                            className="group relative bg-slate-900 rounded-2xl overflow-hidden border border-white/10 hover:border-pink-500/50 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-pink-500/20"
                        >
                            {/* Cover Image */}
                            <div
                                className="aspect-[2/3] w-full bg-cover bg-center cursor-pointer relative"
                                style={{ backgroundImage: `url(http://localhost:8000${story.cover})` }}
                                onClick={() => loadStoryDetails(story.id)}
                            >
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all" />

                                {/* Play Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                                    <span className="bg-white text-black px-6 py-2 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                        Ler Agora
                                    </span>
                                </div>
                            </div>

                            {/* Footer Info */}
                            <div className="p-4 bg-slate-900 absolute bottom-0 w-full border-t border-white/10 backdrop-blur-md bg-opacity-90">
                                <h3 className="text-lg font-bold text-white truncate mb-2">{story.title}</h3>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openStandaloneSite(story.id);
                                    }}
                                    className="text-xs flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors"
                                >
                                    <Globe size={14} /> Abrir como Site <ExternalLink size={10} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Library;
