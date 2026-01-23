import { motion } from 'framer-motion';
import { Plus, ChevronRight, Trash2, User } from 'lucide-react';
import { useStory } from '../../context/StoryContext';

export default function CharacterSelector({ onNext, onBack, onCreateNew }) {
    const { characters, selectCharacter, deleteCharacter, activeCharacter } = useStory();

    const handleSelect = (char) => {
        selectCharacter(char.id);
    };

    const handleContinue = () => {
        if (activeCharacter) {
            onNext();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center space-y-8 relative">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-8 left-8"
            >
                <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
                    &larr; Voltar
                </button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl space-y-8"
            >
                <div className="space-y-4">
                    <h2 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">
                        Escolha seu Viajante
                    </h2>
                    <p className="text-slate-400">
                        Quem viverá esta história?
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                    {characters.map((char) => (
                        <motion.div
                            key={char.id}
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSelect(char)}
                            className={`relative w-48 aspect-[3/4] rounded-2xl glass-panel cursor-pointer overflow-hidden transition-all border-2
                                ${activeCharacter?.id === char.id
                                    ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)]'
                                    : 'border-transparent hover:border-slate-600'}`}
                        >
                            {/* Bg Image or Placeholder */}
                            {char.photos && char.photos[0] ? (
                                <img src={char.photos[0]} alt={char.nickname} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-b from-slate-700 to-slate-900 flex items-center justify-center">
                                    <User size={48} className="text-slate-600" />
                                </div>
                            )}

                            {/* Content */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                                <h3 className={`text-xl font-bold font-serif ${activeCharacter?.id === char.id ? 'text-purple-300' : 'text-slate-200'}`}>
                                    {char.nickname}
                                </h3>
                            </div>

                            {/* Delete Button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteCharacter(char.id); }}
                                className="absolute top-2 right-2 p-2 bg-black/40 rounded-full text-slate-400 hover:text-red-400 hover:bg-black/60 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </motion.div>
                    ))}

                    {/* Create New Card */}
                    <motion.button
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onCreateNew}
                        className="w-48 aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-700 hover:border-purple-500/50 hover:bg-slate-800/30 flex flex-col items-center justify-center gap-4 group cursor-pointer transition-all"
                    >
                        <div className="p-4 rounded-full bg-slate-800 text-slate-500 group-hover:text-purple-400 transition-colors">
                            <Plus size={32} />
                        </div>
                        <span className="text-slate-500 group-hover:text-purple-300 font-medium">Novo Viajante</span>
                    </motion.button>
                </div>
            </motion.div>

            {/* Bottom Controls */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed bottom-8"
            >
                <button
                    onClick={handleContinue}
                    disabled={!activeCharacter}
                    className={`px-12 py-4 rounded-full font-bold text-lg flex items-center gap-3 transition-all
                        ${activeCharacter
                            ? 'btn-primary cursor-pointer hover:scale-105 shadow-xl'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                >
                    <span>Continuar</span>
                    <ChevronRight />
                </button>
            </motion.div>
        </div>
    );
}
