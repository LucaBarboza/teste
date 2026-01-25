import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const StoryContext = createContext();

export function StoryProvider({ children }) {
    // Load characters from local storage
    const [characters, setCharacters] = useState(() => {
        const saved = localStorage.getItem('imaginaria_characters');
        return saved ? JSON.parse(saved) : [];
    });

    const [activeCharacter, setActiveCharacter] = useState(() => {
        const saved = localStorage.getItem('imaginaria_active_character');
        return saved ? JSON.parse(saved) : null;
    });

    const [generationState, setGenerationState] = useState({
        isLoading: false,
        result: null,
        error: null,
        logs: []
    });

    // Persist characters whenever they change
    useEffect(() => {
        localStorage.setItem('imaginaria_characters', JSON.stringify(characters));
    }, [characters]);

    // Persist active character
    useEffect(() => {
        if (activeCharacter) {
            localStorage.setItem('imaginaria_active_character', JSON.stringify(activeCharacter));
        } else {
            localStorage.removeItem('imaginaria_active_character');
        }
    }, [activeCharacter]);

    const addCharacter = useCallback((newCharacter) => {
        setCharacters(prev => [...prev, { ...newCharacter, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]);
    }, []);

    const deleteCharacter = useCallback((id) => {
        setCharacters(prev => prev.filter(c => c.id !== id));
        if (activeCharacter?.id === id) {
            setActiveCharacter(null);
        }
    }, [activeCharacter]);

    const selectCharacter = useCallback((id) => {
        const char = characters.find(c => c.id === id);
        if (char) setActiveCharacter(char);
    }, [characters]);

    const startGeneration = useCallback(async (storyData) => {
        if (!storyData || !storyData.character) {
            console.error("startGeneration called without storyData or character", storyData);
            setGenerationState(prev => ({
                ...prev,
                isLoading: false,
                error: "Dados da história incompletos."
            }));
            return;
        }

        setGenerationState(prev => ({
            ...prev,
            isLoading: true,
            error: null,
            logs: ["Iniciando motor criativo...", "Conectando ao núcleo de imaginação..."]
        }));

        try {
            // 1. Prepare Data
            const formData = new FormData();
            formData.append('nome', storyData.character.nickname);
            formData.append('estilo', storyData.style);
            formData.append('universo', storyData.universe);
            formData.append('genero', storyData.genre);
            if (storyData.description) {
                formData.append('descricao', storyData.description);
            }

            setGenerationState(prev => ({
                ...prev,
                logs: [...prev.logs, "Processando perfil do herói..."]
            }));

            // Convert blob URLs back to Blobs to send to API
            if (storyData.character.photos && storyData.character.photos.length > 0) {
                for (const photoUrl of storyData.character.photos) {
                    const response = await fetch(photoUrl);
                    const blob = await response.blob();
                    formData.append('imagens', blob, "reference.jpg");
                }
            }

            setGenerationState(prev => ({
                ...prev,
                logs: [...prev.logs, "Enviando dados para o oráculo (Gemini)..."]
            }));

            // 2. Call Story Generation API
            const response = await fetch('/api/generate-story', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Falha ao gerar história');
            }

            const result = await response.json();
            const generatedStory = result.data;

            // 3. Image Generation (REAL)
            setGenerationState(prev => ({
                ...prev,
                logs: [...prev.logs, "História escrita com sucesso!", "Iniciando geração das ilustrações..."]
            }));

            // Fetch reference image blobs once to reuse
            const referenceBlobs = [];
            if (storyData.character.photos && storyData.character.photos.length > 0) {
                for (const photoUrl of storyData.character.photos) {
                    const res = await fetch(photoUrl);
                    const blob = await res.blob();
                    referenceBlobs.push(blob);
                }
            }

            // Helper to generate a single image
            const generateSingleImage = async (prompt, descriptor) => {
                setGenerationState(prev => ({
                    ...prev,
                    logs: [...prev.logs, `Pintando: ${descriptor}...`]
                }));

                const imgFormData = new FormData();
                imgFormData.append('prompt', prompt);
                imgFormData.append('person_name', storyData.character.nickname);
                imgFormData.append('universe_context', storyData.universe);

                referenceBlobs.forEach((blob) => {
                    imgFormData.append('reference_images', blob, "ref.jpg");
                });

                try {
                    const res = await fetch('/api/generate-image', {
                        method: 'POST',
                        body: imgFormData
                    });

                    if (!res.ok) throw new Error('Falha na geração de imagem');
                    const data = await res.json();
                    return data.image_url; // Returns /images/uuid.png
                } catch (e) {
                    console.error(`Erro ao gerar imagem (${descriptor}):`, e);
                    return `https://placehold.co/600x400/e3dccb/2a1a10?text=Erro:+${encodeURIComponent(descriptor)}`;
                }
            };

            // Generate Cover
            const coverUrl = await generateSingleImage(generatedStory.cover_prompt, "Capa do Livro");

            // Generate Chapters
            const chapterImages = [];
            for (let i = 0; i < generatedStory.parts.length; i++) {
                const part = generatedStory.parts[i];
                const prompt = part[1];
                const imgUrl = await generateSingleImage(prompt, `Cena ${i + 1}`);
                chapterImages.push(imgUrl);
            }

            const finalResult = {
                title: generatedStory.title,
                cover_image: coverUrl,
                parts: generatedStory.parts,
                chapters: chapterImages.map((url, index) => ({
                    image_url: url
                }))
            };

            // Auto-save the story
            saveStory(finalResult);

            setGenerationState(prev => ({
                ...prev,
                isLoading: false,
                logs: [...prev.logs, "Livro finalizado com ilustrações!", "Salvo no grimório."],
                result: finalResult
            }));

        } catch (error) {
            console.error("Generation Error:", error);
            setGenerationState(prev => ({
                ...prev,
                isLoading: false,
                error: error.message,
                logs: [...prev.logs, `Erro: ${error.message}`]
            }));
        }
    }, []);

    const saveStory = useCallback(async (result) => {
        console.log("Saving story...", result);
        try {
            const savePayload = {
                title: result.title,
                cover_image_url: result.cover_image,
                chapters: result.chapters.map(c => ({
                    text: result.parts.find(p => p[1].includes(c.image_url.split('text=')[1]?.replace(/\+/g, ' ') || ''))?.[0] || "", // Try to find text matching prompt or fallback
                    image_url: c.image_url
                }))
            };

            // Fix: Map text correctly from parts since chapters might not have it directly if constructed differently
            // Re-constructing payload to be safer based on how finalResult is built in startGeneration
            const payload = {
                title: result.title,
                cover_image_url: result.cover_image,
                chapters: result.parts.map((part, index) => ({
                    text: part[0],
                    image_url: result.chapters[index].image_url
                }))
            };

            const response = await fetch('/api/save-story', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Falha ao salvar história no backend');
            }

            const data = await response.json();
            console.log("Story saved successfully:", data);
            return data;

        } catch (error) {
            console.error("Error saving story:", error);
            // Don't throw to avoid breaking the UI flow if save fails, just log
        }
    }, []);

    const value = {
        characters,
        activeCharacter,
        addCharacter,
        deleteCharacter,
        selectCharacter,
        generationState,
        setGenerationState,
        startGeneration,
        saveStory
    };

    return (
        <StoryContext.Provider value={value}>
            {children}
        </StoryContext.Provider>
    );
}

export function useStory() {
    const context = useContext(StoryContext);
    if (!context) {
        throw new Error('useStory must be used within a StoryProvider');
    }
    return context;
}
