import { BookOpen, UserPlus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStory } from '../../context/StoryContext';

export default function Home({ onCreateCharacter, onStartStory }) {
    const { characters } = useStory();
    const hasCharacters = characters.length > 0;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center space-y-12 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite_reverse]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6 relative z-10"
            >
                <div className="mb-8">
                    {/* Placeholder for Minimal Logo */}
                    <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-yellow-400 to-purple-600 rounded-xl rotate-45 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                        <Sparkles className="text-white -rotate-45" size={32} />
                    </div>
                </div>

                <h1 className="text-7xl md:text-8xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-purple-200 to-slate-100 drop-shadow-[0_0_25px_rgba(255,255,255,0.3)] tracking-tight">
                    Imaginaria
                </h1>
                <p className="text-xl md:text-2xl text-slate-300 font-light tracking-wide max-w-lg mx-auto font-sans">
                    Crie mundos. Viva histórias.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl px-4 relative z-10">
                <motion.button
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onCreateCharacter}
                    className="glass-panel p-8 rounded-2xl transition-all group cursor-pointer flex flex-col items-center justify-center hover:bg-slate-800/80 hover:border-purple-500/50"
                >
                    <div className="p-4 rounded-full bg-slate-700/50 text-purple-300 mb-4 group-hover:bg-purple-500/20 group-hover:text-purple-200 transition-colors shadow-inner">
                        <UserPlus size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-100 mb-2 font-serif">Criar Personagem</h2>
                    <p className="text-sm text-slate-400">Novo herói para uma nova lenda</p>
                </motion.button>

                <motion.button
                    whileHover={hasCharacters ? { scale: 1.05, y: -5 } : {}}
                    whileTap={hasCharacters ? { scale: 0.95 } : {}}
                    onClick={hasCharacters ? onStartStory : null}
                    className={`glass-panel p-8 rounded-2xl transition-all group flex flex-col items-center justify-center border-slate-700
                        ${hasCharacters
                            ? 'cursor-pointer hover:bg-slate-800/80 hover:border-yellow-500/50'
                            : 'opacity-50 cursor-not-allowed grayscale'}`}
                >
                    <div className={`p-4 rounded-full bg-slate-700/50 mb-4 transition-colors shadow-inner
                        ${hasCharacters ? 'text-yellow-300 group-hover:bg-yellow-500/20 group-hover:text-yellow-200' : 'text-slate-500'}`}>
                        <BookOpen size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-100 mb-2 font-serif">Iniciar Jornada</h2>
                    <p className="text-sm text-slate-400">
                        {hasCharacters ? 'Continue sua aventura mágica' : 'Crie um personagem primeiro'}
                    </p>
                </motion.button>
            </div>
        </div>
    );
}
