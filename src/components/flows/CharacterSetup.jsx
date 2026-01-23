import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X, ChevronRight, User } from 'lucide-react';
import { useStory } from '../../context/StoryContext';

export default function CharacterSetup({ onNext, onBack }) {
    const { addCharacter } = useStory();
    const [nickname, setNickname] = useState('');
    const [photos, setPhotos] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + photos.length > 3) {
            alert("Máximo de 3 fotos permitidas.");
            return;
        }

        const newPhotos = files.map(file => ({
            url: URL.createObjectURL(file), // Note: In a real persistent app this needs to be a real storage URL or Base64
            file
        }));

        setPhotos([...photos, ...newPhotos]);
    };

    const removePhoto = (index) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (!nickname.trim()) return;
        addCharacter({
            nickname,
            photos: photos.map(p => p.url)
        });
        onNext();
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
                className="glass-panel w-full max-w-lg p-8 rounded-3xl space-y-8"
            >
                <div className="space-y-2">
                    <h2 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">
                        Quem será o Herói?
                    </h2>
                    <p className="text-slate-400 text-sm">
                        Para a IA desenhar você na história, precisamos de algumas referências.
                    </p>
                </div>

                {/* Nickname Input */}
                <div className="space-y-4 text-left">
                    <label className="block text-sm font-medium text-slate-300 ml-1">Apelido do Herói</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={20} />
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="Ex: Super Lucas"
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-all font-sans"
                        />
                    </div>
                </div>

                {/* Photo Upload */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-sm font-medium text-slate-300">Fotos de Referência ({photos.length}/3)</label>
                        <span className="text-xs text-slate-500">Rosto claro e iluminado</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {photos.map((photo, index) => (
                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-600 group">
                                <img src={photo.url} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => removePhoto(index)}
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                >
                                    <X className="text-white" />
                                </button>
                            </div>
                        ))}

                        {photos.length < 3 && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square rounded-xl border-2 border-dashed border-slate-700 hover:border-purple-500/50 hover:bg-slate-800/50 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer"
                            >
                                <Camera className="text-slate-500 group-hover:text-purple-400 transition-colors" />
                                <span className="text-xs text-slate-500 group-hover:text-purple-300">Adicionar</span>
                            </button>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        multiple
                        className="hidden"
                    />
                </div>

                {/* Submit Action */}
                <button
                    onClick={handleSubmit}
                    disabled={!nickname.trim()}
                    className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all
                        ${nickname.trim()
                            ? 'btn-primary cursor-pointer hover:scale-[1.02]'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                >
                    <span>Criar Personagem</span>
                    <ChevronRight size={20} />
                </button>
            </motion.div>
        </div>
    );
}
