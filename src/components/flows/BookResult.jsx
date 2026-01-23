import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Download, Library as LibraryIcon, Check } from 'lucide-react';
import { useStory } from '../../context/StoryContext';

export default function BookResult({ onClose }) {
    const { generationState, saveStory } = useStory();
    const { result } = generationState;
    const [currentPage, setCurrentPage] = useState(-1); // -1 = Cover
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error'

    if (!result) return null;

    // Reconstruct pages for easy access
    const pages = result.parts.map((p, i) => ({
        text: p[0],
        img: result.chapters && result.chapters[i] ? result.chapters[i].image_url : null,
        chapter: i + 1
    }));

    const totalPages = pages.length;

    const handleNext = () => {
        if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
    };

    const handlePrev = () => {
        if (currentPage > -1) setCurrentPage(currentPage - 1);
    };

    // Keep for manual triggered save if needed in future, currently unused
    const handleSave = async (e) => {
        e.stopPropagation();
        if (isSaving || saveStatus === 'success') return;

        setIsSaving(true);
        try {
            await saveStory(result);
            setSaveStatus('success');
        } catch (err) {
            console.error(err);
            setSaveStatus('error');
            alert('Erro ao salvar história. Verifique o console.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-8">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50 cursor-pointer"
            >
                <X size={24} />
            </button>

            {/* Increased Container Size */}
            <div className="relative w-full max-w-[95vw] h-[90vh] flex items-center justify-center perspective-1000">

                {/* BOOK CONTAINER */}
                <AnimatePresence mode="wait">
                    {currentPage === -1 ? (
                        // COVER
                        <motion.div
                            key="cover"
                            initial={{ opacity: 0, rotateY: -90 }}
                            animate={{ opacity: 1, rotateY: 0 }}
                            exit={{ opacity: 0, rotateY: 90 }}
                            transition={{ duration: 0.6, type: "spring" }}
                            className="relative w-[500px] h-[750px] bg-slate-800 rounded-r-3xl rounded-l-lg shadow-2xl flex flex-col overflow-hidden transform-style-3d border-l-8 border-slate-900"
                            style={{ boxShadow: '20px 20px 60px rgba(0,0,0,0.6)' }}
                        >
                            <img src={result.cover_image} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

                            <div className="relative z-10 h-full flex flex-col justify-between p-10 text-center border-2 border-yellow-500/20 m-6 rounded-xl">
                                <div className="pt-12">
                                    <h1 className="text-5xl font-serif font-bold text-yellow-100 drop-shadow-lg tracking-wider uppercase leading-tight">
                                        {result.title}
                                    </h1>
                                </div>
                                <div className="pb-12">
                                    <p className="text-white/80 font-serif italic text-xl">Uma história Imaginaria</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-4 z-20">
                                <button
                                    onClick={() => {
                                        if (pages.length > 0) setCurrentPage(0);
                                    }}
                                    className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform cursor-pointer text-lg"
                                >
                                    Abrir Livro
                                </button>

                                <div className="flex items-center gap-2 px-6 py-2 rounded-full font-medium text-sm backdrop-blur-md border bg-green-500/20 border-green-400 text-green-300">
                                    <Check size={16} /> Salvo Automaticamente
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        // OPEN PAGES - WIDER
                        <motion.div
                            key="opened"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex w-full h-full bg-[#fdfbf7] rounded-lg shadow-3xl overflow-hidden text-slate-900 max-w-[1600px] border-8 border-[#2a1a10]"
                        >
                            {pages[currentPage] ? (
                                <>
                                    {/* LEFT PAGE (Image) */}
                                    <div className="w-1/2 h-full bg-slate-100 relative overflow-hidden border-r-2 border-[#e3dccb] shadow-[inset_-10px_0_20px_rgba(0,0,0,0.1)]">
                                        {pages[currentPage].img ? (
                                            <img
                                                src={pages[currentPage].img}
                                                alt={`Chapter ${currentPage + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-serif italic text-xl">Sem Ilustração</div>
                                        )}
                                        <div className="absolute bottom-6 left-6 text-white/90 text-sm bg-black/30 px-3 py-1 rounded backdrop-blur-sm">
                                            Pág. {currentPage + 1}
                                        </div>
                                    </div>

                                    {/* RIGHT PAGE (Text) */}
                                    <div className="w-1/2 h-full p-12 md:p-16 overflow-y-auto relative bg-[url('https://www.transparenttextures.com/patterns/paper.png')] shadow-[inset_10px_0_20px_rgba(0,0,0,0.1)]">
                                        <h3 className="font-serif text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3 border-b-2 border-slate-200 pb-4">
                                            <span className="text-5xl text-purple-700 block float-left mr-3 leading-none font-serif">
                                                {pages[currentPage].text ? pages[currentPage].text.charAt(0) : ''}
                                            </span>
                                            Capítulo {currentPage + 1}
                                        </h3>
                                        <p className="font-serif text-xl leading-loose text-slate-800 text-justify tracking-wide">
                                            {pages[currentPage].text ? pages[currentPage].text.substring(1) : ''}
                                        </p>

                                        {/* Navigation Controls */}
                                        <div className="mt-12 flex justify-between items-center pt-8 border-t border-slate-300">
                                            <button
                                                onClick={handlePrev}
                                                className="group flex items-center gap-2 text-slate-500 hover:text-purple-700 font-bold transition-colors text-lg"
                                            >
                                                <div className="p-2 rounded-full bg-slate-200 group-hover:bg-purple-100 transition-colors">
                                                    <ChevronLeft size={24} />
                                                </div>
                                                Anterior
                                            </button>

                                            {currentPage < totalPages - 1 ? (
                                                <button
                                                    onClick={handleNext}
                                                    className="group flex items-center gap-2 text-slate-500 hover:text-purple-700 font-bold transition-colors text-lg"
                                                >
                                                    Próximo
                                                    <div className="p-2 rounded-full bg-slate-200 group-hover:bg-purple-100 transition-colors">
                                                        <ChevronRight size={24} />
                                                    </div>
                                                </button>
                                            ) : (
                                                <div className="text-purple-700 font-bold text-lg px-4 py-2 border border-purple-200 rounded-lg bg-purple-50">
                                                    Fim da História
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500 text-xl font-serif">
                                    Página não encontrada no grimório.
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
