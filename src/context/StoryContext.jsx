import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const StoryContext = createContext();

export function StoryProvider({ children }) {
    // Load characters from local storage
    const [characters, setCharacters] = useState(() => {
        const saved = localStorage.getItem('imaginaria_characters');
        return saved ? JSON.parse(saved) : [];
    });

    const [activeCharacter, setActiveCharacter] = useState(null);

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
        setGenerationState(prev => ({
            ...prev,
            isLoading: true,
            error: null,
            logs: ["Iniciando motor criativo...", "Conectando ao núcleo de imaginação..."]
        }));

        // TODO: Implement actual API call logic here
        // Simulating Agentic Process
        const steps = [
            "Analisando perfil do personagem...",
            "Construindo universo narrativo...",
            "Escrevendo capítulo 1...",
            "Gerando ilustrações...",
            "Finalizando livro..."
        ];

        for (let i = 0; i < steps.length; i++) {
            await new Promise(r => setTimeout(r, 1500));
            setGenerationState(prev => ({
                ...prev,
                logs: [...prev.logs, steps[i]]
            }));
        }

        setGenerationState(prev => ({
            ...prev,
            isLoading: false,
            result: {
                title: `A Lenda de ${storyData.character.nickname}`,
                cover_image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=600&auto=format&fit=crop",
                parts: [
                    ["Era uma vez, em um universo de possibilidades infinitas, onde a magia e a tecnologia dançavam sob a luz de luas gêmeas. Nosso herói, com coragem no coração e determinação no olhar, estava prestes a iniciar uma jornada que mudaria o destino de todos."],
                    ["O caminho era tortuoso e cheio de desafios. Criaturas sombrias espreitavam nas sombras, mas a luz da esperança guiava seus passos. Cada decisão moldava o futuro, e cada aliado encontrado fortalecia a vontade de vencer."],
                    ["No fim, não foi apenas a vitória sobre o mal que importou, mas as amizades forjadas e as lições aprendidas. A lenda deste herói ecoaria por gerações, inspirando novos aventureiros a olharem para o horizonte e sonharem."]
                ],
                chapters: [
                    { image_url: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=600&auto=format&fit=crop" },
                    { image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop" },
                    { image_url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=600&auto=format&fit=crop" }
                ]
            }
        }));
    }, []);

    const saveStory = useCallback(async (result) => {
        console.log("Saving story...", result);
        // Implement actual save logic or mock
        return Promise.resolve();
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
