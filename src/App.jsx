import StoryForm from './components/StoryForm';

function App() {
    return (
        <div className="container">
            <header style={{ textAlign: 'center', padding: '3rem 0' }}>
                <h1 className="title-gradient" style={{ fontSize: '3.5rem', margin: 0 }}>IMAGINARIA</h1>
                <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                    Onde suas histórias ganham vida com IA
                </p>
            </header>

            <main style={{ maxWidth: '600px', margin: '0 auto' }}>
                <StoryForm />
            </main>
        </div>
    );
}

export default App;
