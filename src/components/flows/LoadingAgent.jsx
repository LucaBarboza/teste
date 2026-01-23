import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Cpu, Terminal } from 'lucide-react';
import { useStory } from '../../context/StoryContext';

export default function LoadingAgent() {
    const { generationState } = useStory();
    const { logs } = generationState;
    const scrollRef = useRef(null);

    // Auto-scroll to bottom of logs
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center relative overflow-hidden">
            {/* Background Tech Effects */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900/0 to-slate-900/0" />
                <div className="grid grid-cols-12 gap-4 h-full w-full opacity-10">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="border-r border-indigo-500/20 h-full" />
                    ))}
                </div>
            </div>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-10 mb-12"
            >
                <div className="relative">
                    <div className="absolute inset-0 blur-2xl bg-indigo-500/30 rounded-full animate-pulse" />
                    <Cpu size={64} className="text-indigo-400 relative z-10 animate-[bounce_3s_infinite]" />
                </div>
            </motion.div>

            <h2 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 mb-8 relative z-10">
                Imaginaria Agent
            </h2>

            {/* Agentic Log Terminal */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-lg bg-black/80 border border-indigo-500/30 rounded-xl p-6 font-mono text-sm text-left shadow-2xl backdrop-blur-md relative z-10"
            >
                <div className="flex items-center gap-2 text-slate-500 mb-4 border-b border-slate-800 pb-2">
                    <Terminal size={14} />
                    <span className="text-xs uppercase tracking-widest">System Log</span>
                </div>

                <div ref={scrollRef} className="h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    <AnimatePresence mode='popLayout'>
                        {logs.map((log, index) => (
                            <motion.div
                                key={index} // Using index as key since logs are sequential strings
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-start gap-3"
                            >
                                <span className="text-purple-500 mt-1">➜</span>
                                <span className={index === logs.length - 1 ? "text-indigo-300 animate-pulse font-bold" : "text-slate-400"}>
                                    {log}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {logs.length === 0 && (
                        <span className="text-slate-600 italic">Inicializando protocolos...</span>
                    )}
                </div>
            </motion.div>

            <p className="mt-8 text-xs text-slate-500 uppercase tracking-widest animate-pulse">
                Processando Criatividade
            </p>
        </div>
    );
}
