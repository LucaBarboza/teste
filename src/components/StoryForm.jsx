import { useState } from 'react';
import { Upload, Sparkles, Wand2, BookOpen, User, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StoryForm() {
    const [formData, setFormData] = useState({
        nome: '',
        estilo: '',
        universo: '',
        genero: 'Aventura',
        descricao: ''
    });
    const [images, setImages] = useState([]);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [generatedImages, setGeneratedImages] = useState({});
    const [generatingImg, setGeneratingImg] = useState(null); // stores the key of the image being generated

    const generos = [
        "Aventura", "Fantasia", "Ficção Científica", "Mistério", "Terror",
        "Comédia", "Romance", "Super-heróis", "Conto de Fadas", "Cyberpunk"
    ];

    const handleImageChange = (e) => {
        if (e.target.files) {
            setImages(Array.from(e.target.files));
        }
    };

    const generateRandomDescription = () => {
        const ideas = [
            "descobre um portal secreto no guarda-roupa que leva a um reino esquecido.",
            "encontra um mapa antigo que promete a localização de um tesouro lendário.",
            "acorda com superpoderes estranhos e precisa salvar a cidade de uma invasão alienígena.",
            "é transportado para o futuro e deve encontrar um jeito de voltar para casa.",
            "herda uma loja de magia falida e precisa fazê-la prosperar novamente.",
            "participa de uma corrida intergaláctica valendo o destino do planeta Terra.",
            "faz amizade com um dragão solitário que vive nas montanhas proibidas.",
            "investiga o mistério do desaparecimento de todos os gatos da vizinhança.",
            "troca de corpo com o presidente e tem que governar o país por um dia.",
            "vira o personagem principal de seu videogame favorito e precisa zerar o jogo para sair."
        ];
        const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
        setFormData(prev => ({ ...prev, descricao: `O protagonista ${randomIdea}` }));
    };

    const generateImageFromPrompt = async (prompt) => {
        const data = new FormData();
        data.append('prompt', prompt);
        data.append('person_name', formData.nome);
        data.append('universe_context', formData.universo);
        images.forEach((img) => {
            data.append('reference_images', img);
        });

        const response = await fetch('/api/generate-image', {
            method: 'POST',
            body: data,
        });

        const result = await response.json();
        if (response.ok && result.status === 'success') {
            return `${result.image_url}`;
        } else {
            throw new Error(result.detail || 'Erro na geração de imagem');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });
        setGeneratedImages({}); // Reset images

        const data = new FormData();
        data.append('nome', formData.nome);
        data.append('estilo', formData.estilo);
        data.append('universo', formData.universo);
        data.append('genero', formData.genero);
        data.append('descricao', formData.descricao);

        images.forEach((img) => {
            data.append('imagens', img);
        });

        try {
            // 1. Generate Story Text
            const response = await fetch('/api/generate-story', {
                method: 'POST',
                body: data,
            });

            const result = await response.json();

            if (!response.ok || result.status !== 'success') {
                throw new Error(result.detail || 'Erro ao gerar história');
            }

            const storyData = result.data;
            const tempImages = {};

            // 2. Generate Cover
            setLoading(true); // Ensure loading is still true
            // Custom loading message could be added to state if we had a separate state for it, 
            // but for now we'll use the button text or a status message.
            // Since `loading` is boolean, we can't show granular progress easily without adding a state.
            // Let's add a temporary status message to inform the user.
            setStatus({ type: 'success', message: '📖 História escrita! Criando a capa mágica...' });

            try {
                const coverUrl = await generateImageFromPrompt(storyData.cover_prompt);
                tempImages['cover'] = coverUrl;
            } catch (err) {
                console.error("Erro na capa:", err);
            }

            // 3. Generate Chapters
            for (let i = 0; i < storyData.parts.length; i++) {
                setStatus({ type: 'success', message: `🎨 Ilustrando capítulo ${i + 1} de ${storyData.parts.length}...` });
                try {
                    const partPrompt = storyData.parts[i][1];
                    const imgUrl = await generateImageFromPrompt(partPrompt);
                    tempImages[i] = imgUrl; // Index as key
                } catch (err) {
                    console.error(`Erro no capítulo ${i}:`, err);
                }
            }

            // 4. Finish
            setGeneratedImages(tempImages);
            setStatus({
                type: 'success',
                message: '✨ Seu livro mágico está pronto!',
                data: storyData
            });

        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: `❌ Erro: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    // Kept for individual manual regeneration if needed later
    const handleGenerateImage = async (key, prompt) => {
        setGeneratingImg(key);
        try {
            const url = await generateImageFromPrompt(prompt);
            setGeneratedImages(prev => ({ ...prev, [key]: url }));
        } catch (error) {
            alert('Erro ao gerar imagem: ' + error.message);
        } finally {
            setGeneratingImg(null);
        }
    };

    return (
        <div className="glass-panel">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 className="title-gradient" style={{ fontSize: '2rem', margin: 0 }}>Criar Nova História</h2>
                <p style={{ color: 'var(--text-muted)' }}>Configure os detalhes da sua aventura mágica</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="label"><User size={16} style={{ display: 'inline', marginRight: 5 }} /> Nome do Protagonista</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="Ex: Super Ricardo"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                        <label className="label"><Wand2 size={16} /> Universo</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Ex: Harry Potter, Star Wars..."
                            value={formData.universo}
                            onChange={(e) => setFormData({ ...formData, universo: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="label"><Sparkles size={16} /> Estilo Visual</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Ex: Pixar, Anime, Realista..."
                            value={formData.estilo}
                            onChange={(e) => setFormData({ ...formData, estilo: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="label"><BookOpen size={16} /> Gênero da História</label>
                    <select
                        className="select"
                        value={formData.genero}
                        onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                    >
                        {generos.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label className="label" style={{ margin: 0 }}><Sparkles size={16} /> Sobre a História (Opcional)</label>
                        <button
                            type="button"
                            onClick={generateRandomDescription}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--secondary)',
                                color: 'var(--secondary)',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer'
                            }}
                            title="Gerar ideia aleatória"
                        >
                            <Wand2 size={12} /> Ideia Mágica
                        </button>
                    </div>
                    <textarea
                        className="input"
                        placeholder="Descreva o que acontece na história ou deixe vazio para uma surpresa aleatória..."
                        rows="3"
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        style={{ resize: 'vertical' }}
                    />
                </div>

                <div className="form-group">
                    <label className="label"><ImageIcon size={16} /> Fotos de Referência (Rosto)</label>
                    <div className="file-drop" onClick={() => document.getElementById('file-input').click()}>
                        <input
                            id="file-input"
                            type="file"
                            multiple
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageChange}
                        />
                        <Upload size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                        <p>Clique para selecionar suas fotos</p>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {images.length > 0 ? `${images.length} imagens selecionadas` : 'Formatos: JPG, PNG, WEBP'}
                        </span>
                    </div>
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Gerando História com IA...' : 'Criar Livro Mágico'} <Sparkles size={18} />
                </button>

                {
                    status.message && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                marginTop: '1.5rem',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                backgroundColor: status.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: status.type === 'success' ? '#4ade80' : '#f87171',
                                textAlign: 'center'
                            }}
                        >
                            {status.message}
                        </motion.div>
                    )
                }

                {
                    status.data && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{ marginTop: '2rem', textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}
                        >
                            <h3 style={{ marginTop: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <BookOpen size={18} /> {status.data.title}
                            </h3>

                            <div style={{ marginBottom: '1rem', fontStyle: 'italic', color: '#aaa', fontSize: '0.9rem' }}>
                                <p>Prompt Capa: "{status.data.cover_prompt}"</p>
                                {generatedImages['cover'] ? (
                                    <img src={generatedImages['cover']} alt="Capa" style={{ width: '100%', borderRadius: '8px', marginTop: '10px' }} />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleGenerateImage('cover', status.data.cover_prompt)}
                                        disabled={generatingImg === 'cover'}
                                        style={{ marginTop: '10px', background: 'var(--primary)', border: 'none', padding: '8px 16px', borderRadius: '4px', color: 'white', cursor: 'pointer' }}
                                    >
                                        {generatingImg === 'cover' ? 'Gerando...' : '🎨 Gerar Capa'}
                                    </button>
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {status.data.parts.map((part, idx) => (
                                    <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem' }}>
                                        <strong style={{ color: 'var(--secondary)' }}>Capítulo {idx + 1}</strong>
                                        <p style={{ fontSize: '0.9rem', color: '#ddd', margin: '0.5rem 0', whiteSpace: 'pre-wrap' }}>{part[0]}</p>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Prompt: {part[1]}</div>

                                        {generatedImages[idx] ? (
                                            <img src={generatedImages[idx]} alt={`Capítulo ${idx + 1}`} style={{ width: '100%', borderRadius: '8px', marginTop: '10px' }} />
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleGenerateImage(idx, part[1])}
                                                disabled={generatingImg === idx}
                                                style={{ marginTop: '10px', background: 'var(--secondary)', border: 'none', padding: '8px 16px', borderRadius: '4px', color: 'black', cursor: 'pointer' }}
                                            >
                                                {generatingImg === idx ? 'Gerando...' : '🎨 Gerar Ilustração'}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )
                }
            </form >
        </div >
    );
}
