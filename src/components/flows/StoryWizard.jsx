import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Wand2, Sparkles, Shuffle } from 'lucide-react';
import { useStory } from '../../context/StoryContext';

const UNIVERSES = [
    { id: 'fantasy_medieval', label: 'Medieval Fantástico', color: 'from-amber-700 to-orange-900', desc: 'Dragões & Reis' },
    { id: 'star_wars', label: 'Guerra nas Estrelas', color: 'from-blue-600 to-cyan-800', desc: 'Força & Sabres' },
    { id: 'harry_potter', label: 'Mundo Bruxo', color: 'from-purple-800 to-indigo-900', desc: 'Magia em Hogwarts' },
    { id: 'marvel', label: 'Universo Marvel', color: 'from-red-600 to-red-900', desc: 'Super-heróis' },
    { id: 'dc', label: 'Universo DC', color: 'from-slate-700 to-slate-900', desc: 'Lendas da Justiça' },
    { id: 'disney_princess', label: 'Conto de Fadas', color: 'from-pink-400 to-rose-600', desc: 'Princesas & Magia' },
    { id: 'simpsons', label: 'Springfield', color: 'from-yellow-400 to-yellow-600', desc: 'Comédia Amarela' },
    { id: 'cyberpunk', label: 'Cyberpunk 2077', color: 'from-yellow-300 to-yellow-500', desc: 'High Tech Low Life' },
    { id: 'lord_rings', label: 'Terra Média', color: 'from-green-700 to-emerald-900', desc: 'Uma Jornada Épica' },
    { id: 'pokemon', label: 'Mundo Pokémon', color: 'from-red-500 to-white', desc: 'Temos que pegar!' },
    { id: 'pirates', label: 'Piratas', color: 'from-blue-900 to-slate-900', desc: '7 Mares' },
    { id: 'western', label: 'Velho Oeste', color: 'from-orange-800 to-amber-900', desc: 'Bang Bang' },
    { id: 'noir', label: 'Noir Investigativo', color: 'from-gray-800 to-black', desc: 'Mistério em P&B' },
    { id: 'steampunk', label: 'Steampunk', color: 'from-amber-600 to-yellow-800', desc: 'Vapor & Engrenagens' },
    { id: 'apocalyptic', label: 'Pós-Apocalipse', color: 'from-stone-700 to-stone-900', desc: 'Sobrevivência' },
];

const STYLES = [
    { id: 'pixar', label: 'Pixar 3D', desc: 'Estilo de animação moderna e fofa.' },
    { id: 'disney_2d', label: 'Disney Clássico', desc: 'Traço tradicional 2D feito à mão.' },
    { id: 'anime', label: 'Anime Studio Ghibli', desc: 'Traços detalhados e cores vibrantes.' },
    { id: 'comic', label: 'Comic Book', desc: 'Estilo de quadrinhos ocidentais com hachuras.' },
    { id: 'watercolor', label: 'Aquarela', desc: 'Pintura suave e artística.' },
    { id: 'realistic', label: 'Fotorealista', desc: 'Como se fosse um filme live-action.' },
    { id: 'cyber_art', label: 'Neon Digital', desc: 'Arte digital com muito brilho e neon.' },
    { id: 'claymation', label: 'Massinha (Clay)', desc: 'Estilo stop-motion tátil.' },
    { id: 'pixel_art', label: 'Pixel Art', desc: 'Estilo retrô de jogos 16-bit.' },
    { id: 'oil_painting', label: 'Pintura a Óleo', desc: 'Textura clássica de tela.' },
];

const GENRES = [
    { id: 'epic', label: 'Aventura Épica' },
    { id: 'comedy', label: 'Comédia' },
    { id: 'romance', label: 'Romance' },
    { id: 'mystery', label: 'Mistério' },
    { id: 'horror', label: 'Terror' },
    { id: 'scifi', label: 'Ficção Científica' },
    { id: 'fantasy', label: 'Fantasia' },
    { id: 'drama', label: 'Drama' },
    { id: 'fable', label: 'Fábula Moral' },
    { id: 'thriller', label: 'Suspense' },
];

const PROMPTS = [
    "Uma jornada para recuperar um artefato perdido que controla o tempo.",
    "Um mal-entendido leva a uma aliança improvável entre inimigos.",
    "Uma descoberta científica muda tudo o que sabemos sobre a realidade.",
    "Em um mundo onde a música é magia, alguém perdeu sua voz.",
    "Uma festa surpresa que acaba salvando o reino de uma invasão."
];

export default function StoryWizard({ onNext, onBack }) {
    const { startGeneration, activeCharacter } = useStory();
    const [step, setStep] = useState(1);
    const [data, setData] = useState({
        universe: null,
        style: null,
        genre: null,
        description: ''
    });

    const handleSelect = (key, value) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    const handleRandomPrompt = () => {
        const random = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
        setData(prev => ({ ...prev, description: random }));
    };

    const handleContinue = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            // Finalize
            startGeneration({ ...data, character: activeCharacter });
            onNext();
        }
    };

    const isStepValid = () => {
        if (step === 1) return !!data.universe;
        if (step === 2) return !!data.style;
        if (step === 3) return !!data.genre;
        return false;
    };

    return (
        <div className="min-h-screen flex flex-col items-center pt-10 px-4 pb-20 relative">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-8 left-8 z-20"
            >
                <button onClick={step === 1 ? onBack : () => setStep(step - 1)} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                    <ChevronLeft size={20} /> Voltar
                </button>
            </motion.div>

            {/* Progress */}
            <div className="w-full max-w-2xl flex gap-2 mb-10">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-slate-800'}`} />
                ))}
            </div>

            <div className="w-full max-w-6xl">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <h2 className="text-4xl font-bold font-serif text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300">
                                Escolha o Universo
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {UNIVERSES.map((u) => (
                                    <motion.button
                                        key={u.id}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleSelect('universe', u.id)}
                                        className={`relative aspect-[3/4] rounded-xl overflow-hidden flex flex-col justify-end p-4 text-left transition-all border-2
                                            ${data.universe === u.id ? 'border-purple-500 ring-2 ring-purple-500/50' : 'border-transparent hover:border-slate-500'}`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${u.color} opacity-40`} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                        <span className="relative z-10 font-bold text-lg leading-tight">{u.label}</span>
                                        <span className="relative z-10 text-xs text-slate-300">{u.desc}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <h2 className="text-4xl font-bold font-serif text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">
                                Estilo Visual
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {STYLES.map((s) => (
                                    <motion.button
                                        key={s.id}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleSelect('style', s.id)}
                                        className={`p-6 rounded-xl border flex flex-col items-center text-center gap-3 transition-all backdrop-blur-md
                                            ${data.style === s.id
                                                ? 'bg-purple-500/20 border-purple-500 shadow-lg'
                                                : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800/60'}`}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center">
                                            <Sparkles size={20} className={data.style === s.id ? 'text-purple-300' : 'text-slate-500'} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-200">{s.label}</h3>
                                            <p className="text-xs text-slate-400 mt-1">{s.desc}</p>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8 max-w-4xl mx-auto"
                        >
                            <h2 className="text-4xl font-bold font-serif text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500">
                                Gênero & Trama
                            </h2>

                            <div className="space-y-6 glass-panel p-8 rounded-2xl">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-3">Gênero Literário</label>
                                    <div className="flex flex-wrap gap-3">
                                        {GENRES.map((g) => (
                                            <button
                                                key={g.id}
                                                onClick={() => handleSelect('genre', g.id)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                                                    ${data.genre === g.id
                                                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                                            >
                                                {g.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-slate-400">
                                        Ideia da História (Opcional)
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => handleSelect('description', e.target.value)}
                                            placeholder="Descreva brevemente sua ideia ou clique no dado para gerar algo aleatório..."
                                            className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 focus:border-amber-500 focus:outline-none resize-none"
                                        />
                                        <button
                                            onClick={handleRandomPrompt}
                                            className="absolute bottom-4 right-4 p-2 bg-slate-700 rounded-lg hover:bg-amber-500 hover:text-black transition-colors"
                                            title="Gerar ideia aleatória"
                                        >
                                            <Shuffle size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Next Button */}
                <div className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none">
                    <button
                        onClick={handleContinue}
                        disabled={!isStepValid()}
                        className={`pointer-events-auto flex items-center gap-2 px-10 py-4 rounded-full font-bold text-lg transition-all shadow-xl
                            ${isStepValid()
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105 hover:shadow-purple-500/30'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                            }`}
                    >
                        <span>{step === 3 ? 'Criar História' : 'Próximo'}</span>
                        {step === 3 ? <Wand2 size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
