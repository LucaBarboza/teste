import React, { useRef, useMemo, forwardRef, useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStory } from '../../context/StoryContext';
import HTMLFlipBook from 'react-pageflip';
import { motion } from 'framer-motion';

// --- Components ---

// 1. Capa (Hardcover)
const Cover = forwardRef((props, ref) => {
    return (
        <div
            className="demoPage bg-[#1a1a1a] h-full rounded-r-lg overflow-hidden relative shadow-2xl flex flex-col"
            ref={ref}
            data-density="hard"
        >
            {/* Seção da Imagem (Top 65%) */}
            <div className="relative h-[65%] w-full overflow-hidden border-b-4 border-yellow-600/30">
                {props.image ? (
                    <img
                        src={props.image}
                        alt="Capa do Livro"
                        className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-1000"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900" />
                )}

                {/* Overlay sutis na imagem */}
                <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.6)] z-10 pointer-events-none"></div>

                {/* Efeito de lombada (Spine) na esquerda (só na parte da imagem) */}
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/60 to-transparent z-20"></div>
            </div>

            {/* Seção do Título (Bottom 35%) */}
            <div className="relative h-[35%] w-full flex flex-col items-center justify-center p-6 text-center bg-[#151515]">
                {/* Textura de couro/material apenas na parte de baixo */}
                <div className="absolute inset-0 mix-blend-multiply opacity-60 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] pointer-events-none"></div>
                {/* Efeito de lombada (Spine) na esquerda (parte de baixo) */}
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/60 to-transparent z-20"></div>

                <div className="relative z-30 flex flex-col items-center w-full">
                    <div className="uppercase tracking-[0.2em] text-yellow-500/60 text-[10px] font-bold mb-2">
                        Edição Especial
                    </div>

                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-yellow-100 drop-shadow-md leading-tight mb-3 line-clamp-2 px-4">
                        {props.title || "Conto Sem Título"}
                    </h1>

                    <div className="w-32 h-px bg-yellow-600/40 my-2"></div>

                    <div className="text-yellow-200/40 font-serif italic text-sm">
                        Uma criação Imaginária
                    </div>
                </div>
            </div>
        </div>
    );
});

Cover.displayName = 'Cover';

// 2. Página de Texto (Paper)
const TextPage = forwardRef((props, ref) => {
    return (
        <div className="demoPage h-full bg-[#fdfbf7] md:border-l border-[#e3dccb] overflow-hidden relative" ref={ref}>
            {/* Textura de Papel */}
            <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]"></div>

            {/* Sombra interna da dobra (gutter) */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-10"></div>

            <div className="relative z-20 h-full p-8 md:p-12 flex flex-col justify-start">
                <div className="flex items-center justify-between mb-8 border-b-2 border-slate-200 pb-4">
                    <span className="font-serif text-slate-400 italic text-sm">Capítulo {props.chapter}</span>
                    <span className="font-serif text-slate-300 font-bold text-xs">{props.number}</span>
                </div>

                <p className="font-serif text-[1.1rem] leading-[1.8] text-slate-800 text-justify tracking-wide selection:bg-yellow-200 selection:text-black">
                    {/* Letra Capitular Elegante */}
                    <span className="float-left text-5xl font-serif font-bold text-slate-900 mr-2 mt-[-8px] leading-none">
                        {props.children?.charAt(0)}
                    </span>
                    {props.children?.slice(1)}
                </p>

                {/* Decoração de fim de página */}
                <div className="mt-auto pt-8 flex justify-center opacity-30">
                    ✨
                </div>
            </div>
        </div>
    );
});
TextPage.displayName = 'TextPage';

// 3. Página de Imagem (Paper) - Full Bleed Updated
const ImagePage = forwardRef((props, ref) => {
    return (
        <div className="demoPage h-full bg-[#fdfbf7] md:border-r border-[#e3dccb] overflow-hidden relative" ref={ref}>
            {/* Imagem Full Size */}
            <div className="absolute inset-0 w-full h-full">
                {props.image ? (
                    <img src={props.image} className="w-full h-full object-cover" alt="Ilustração" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-serif italic">
                        (Imagem sendo gerada...)
                    </div>
                )}
            </div>

            {/* Sombra interna da dobra (gutter) */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/30 to-transparent pointer-events-none z-10"></div>

            {/* Vinheta Sutil */}
            <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.2)] pointer-events-none z-10"></div>

            {/* Page Number Overlay */}
            <div className="absolute bottom-4 w-full flex justify-center z-20 pointer-events-none">
                <span className="text-white/90 font-serif text-xs font-bold px-3 py-1 bg-black/30 rounded-full backdrop-blur-sm">
                    {props.number}
                </span>
            </div>
        </div>
    );
});
ImagePage.displayName = 'ImagePage';

// 4. Contra-Capa (Hardcover)
const BackCover = forwardRef((props, ref) => {
    return (
        <div className="demoPage bg-[#1a1a1a] h-full rounded-l-lg shadow-2xl relative overflow-hidden flex items-center justify-center border-l-8 border-slate-900" ref={ref} data-density="hard">
            {/* Textura */}
            <div className="absolute inset-0 mix-blend-multiply opacity-40 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]"></div>

            <div className="relative z-10 text-center p-8">
                <div className="text-yellow-500/40 text-sm tracking-widest uppercase mb-2">Fim da História</div>
                <div className="w-8 h-8 mx-auto border-2 border-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500/20">
                    ★
                </div>
                <div className="mt-12 text-xs text-slate-600">Generated by Imaginária</div>
            </div>
        </div>
    );
});
BackCover.displayName = 'BackCover';

// 5. Página de Copyright (Spacer)
const CopyrightPage = forwardRef((props, ref) => {
    return (
        <div className="demoPage bg-[#fdfbf7] h-full flex items-end justify-center pb-8 border-r border-[#e3dccb]" ref={ref}>
            <div className="text-slate-400 text-[10px] font-sans uppercase tracking-widest text-center">
                © {new Date().getFullYear()} Imaginária<br />
                Todos os direitos reservados
            </div>
        </div>
    );
});
CopyrightPage.displayName = 'CopyrightPage';


// --- Main Component ---

export default function BookResult({ onClose }) {
    const { generationState } = useStory();
    const { result } = generationState;
    const bookRef = useRef();
    const [pageTotal, setPageTotal] = useState(0);

    // Dimensões do Livro (Aspect Ratio de Standard Novel ~ 6x9 in)
    // Vamos usar algo próximo de A5/Trade: 450px x 650px per page
    const BOOK_WIDTH = 700;
    const BOOK_HEIGHT = 600; // Wider landscape-ish feel

    const pages = useMemo(() => {
        if (!result) return [];
        const p = [];

        result.parts.forEach((part, index) => {
            const text = part[0];
            const img = result.chapters?.[index]?.image_url;
            const chapterNum = index + 1;

            // Page Structure logic:
            // Always Pair: Image on Left (Even), Text on Right (Odd)
            // This is a classic visual novel style.

            // Note: In react-pageflip, Page 0 is Cover.
            // Page 1...N are content.

            p.push({
                type: 'image',
                content: img,
                chapter: chapterNum,
                id: `img-${index}`
            });

            p.push({
                type: 'text',
                content: text,
                chapter: chapterNum,
                id: `txt-${index}`
            });
        });
        return p;
    }, [result]);

    useEffect(() => {
        // Pequeno delay para garantir renderização correta das sombras
    }, []);

    // Handlers para os botões de navegação
    const nextFlip = () => bookRef.current.pageFlip().flipNext();
    const prevFlip = () => bookRef.current.pageFlip().flipPrev();

    if (!result) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#0F0F0F]"
        >
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black opacity-80"></div>

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-3 rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10 transition-all z-[60] group"
            >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* Book Wrapper */}
            <div className="relative z-10 flex items-center justify-center perspective-[1500px]">

                {/* Navigation Arrows (Desktop) */}
                <button onClick={prevFlip} className="hidden md:flex absolute -left-20 top-1/2 -translate-y-1/2 p-4 text-white/20 hover:text-white/80 hover:scale-110 transition-all">
                    <ChevronLeft size={48} />
                </button>

                <button onClick={nextFlip} className="hidden md:flex absolute -right-20 top-1/2 -translate-y-1/2 p-4 text-white/20 hover:text-white/80 hover:scale-110 transition-all">
                    <ChevronRight size={48} />
                </button>

                {/* The Book */}
                <HTMLFlipBook
                    width={BOOK_WIDTH}
                    height={BOOK_HEIGHT}
                    size="fixed" // Use fixed to respect exact dimensions and aspect ratio
                    minWidth={350}
                    maxWidth={1000}
                    minHeight={500}
                    maxHeight={1500}
                    maxShadowOpacity={0.5}
                    showCover={true}
                    mobileScrollSupport={true}
                    className="shadow-2xl"
                    ref={bookRef}
                    usePortrait={false} // Force landscape spread on desktop if possible
                    startZIndex={30}
                    autoSize={true}
                    drawShadow={true}
                    flippingTime={1000}
                    useMouseEvents={true}
                >
                    {/* Cover (Page 0) */}
                    <Cover title={result.title} image={result.cover_image} />

                    {/* Dedication / Title Page (Page 1 - Left) */}
                    <div className="demoPage bg-[#fdfbf7] h-full flex items-center justify-center text-center p-10 border-l border-[#e3dccb]">
                        <div className="max-w-xs">
                            <h2 className="font-serif text-2xl font-bold text-slate-800 mb-4">{result.title}</h2>
                            <div className="h-px w-20 bg-slate-300 mx-auto my-6"></div>
                            <p className="font-serif italic text-slate-500">
                                "Para todos os viajantes da imaginação."
                            </p>
                        </div>
                    </div>

                    {/* Copyright Page (Page 2 - Right) */}
                    <CopyrightPage />

                    {/* Content Pages */}
                    {pages.map((page, i) => {
                        const pageNum = i + 1;
                        if (page.type === 'image') {
                            return <ImagePage key={page.id} number={pageNum} image={page.content} />;
                        } else {
                            return <TextPage key={page.id} number={pageNum} chapter={page.chapter}>{page.content}</TextPage>;
                        }
                    })}

                    {/* End Page / Blank */}
                    <div className="demoPage bg-[#fdfbf7] h-full"></div>

                    {/* Back Cover */}
                    <BackCover />

                </HTMLFlipBook>
            </div>

            {/* Mobile Helper */}
            <div className="absolute bottom-8 text-white/30 text-xs font-medium uppercase tracking-widest pointer-events-none animate-pulse">
                Arraste os cantos para virar
            </div>

        </motion.div>
    );
}
