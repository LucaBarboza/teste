import { useState, useEffect } from 'react';
import { StoryProvider, useStory } from './context/StoryContext';

// Components
import CharacterSelector from './components/flows/CharacterSelector';

import Home from './components/flows/Home';
import CharacterSetup from './components/flows/CharacterSetup';
import StoryWizard from './components/flows/StoryWizard';
import LoadingAgent from './components/flows/LoadingAgent';
import BookResult from './components/flows/BookResult';
import { AnimatePresence, motion } from 'framer-motion';

function AppContent() {
    const { startGeneration, generationState } = useStory();
    const [view, setView] = useState('HOME');

    // Watch for generation completion
    useEffect(() => {
        if (generationState.result) {
            setView('RESULT');
        }
    }, [generationState.result]);

    const handleCreateChar = () => setView('CHARACTER');

    // Updated: Selector is now the first step of story creation if characters exist
    const handleStartStory = () => setView('SELECTOR');

    const handleCharacterComplete = () => setView('HOME'); // Return to home after creating

    const handleSelectorComplete = () => setView('WIZARD');

    const handleWizardComplete = () => {
        setView('LOADING');
        // startGeneration is called inside StoryWizard with data
    };

    const currentView = () => {
        if (view === 'LOADING') return <LoadingAgent />; // Loading has no back
        if (view === 'RESULT') return <BookResult onClose={() => setView('HOME')} />;

        switch (view) {
            case 'HOME':
                return <Home onCreateCharacter={handleCreateChar} onStartStory={handleStartStory} />;
            case 'CHARACTER':
                // Temporarily using CharacterSetup if it exists, or will update it next
                return <CharacterSetup onNext={handleCharacterComplete} onBack={() => setView('HOME')} />;
            case 'SELECTOR':
                return <CharacterSelector onNext={handleSelectorComplete} onBack={() => setView('HOME')} onCreateNew={handleCreateChar} />;
            case 'WIZARD':
                return <StoryWizard onNext={handleWizardComplete} onBack={() => setView('SELECTOR')} />;
            default:
                return <Home onCreateCharacter={handleCreateChar} onStartStory={handleStartStory} />;
        }
    };

    return (
        <div className="text-slate-200 min-h-screen bg-transparent">
            <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    initial={{ opacity: 0, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(10px)' }}
                    transition={{ duration: 0.4 }}
                    className="w-full min-h-screen"
                >
                    {currentView()}
                </motion.div>
            </AnimatePresence>
        </div >
    );
}

function App() {
    return (
        <StoryProvider>
            <AppContent />
        </StoryProvider>
    );
}

export default App;
