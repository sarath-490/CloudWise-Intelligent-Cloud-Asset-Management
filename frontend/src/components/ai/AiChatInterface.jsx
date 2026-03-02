import React, { useState, useEffect, useRef } from 'react';
import aiService from '../../services/aiService';
import Loader from '../common/Loader';
import { Sparkles, X, Send, Bot, MessageSquare, User, Zap, Brain } from 'lucide-react';

const AiChatInterface = () => {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([
        { role: 'model', content: 'Hello! I\'m your CloudWise AI Assistant. I can help you find files, summarize documents, or answer questions about your storage.' }
    ]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        const userMessage = { role: 'user', content: query };
        setMessages(prev => [...prev, userMessage]);
        setQuery('');
        setLoading(true);

        try {
            const result = await aiService.chat(query);
            const aiResponse = result.response || "I couldn't process that query. Please try again.";
            const aiMessage = { role: 'model', content: aiResponse };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', content: 'Sorry, something went wrong. Please make sure the AI service is configured and try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-10 right-10 bg-indigo-600 text-white w-16 h-16 rounded-[24px] shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 hover:-translate-y-2 transition-all z-50 flex items-center justify-center group active:scale-95"
            >
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></div>
                <Sparkles size={28} className="text-white group-hover:scale-110 transition-transform" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-10 right-10 w-[420px] max-w-[calc(100vw-2rem)] h-[650px] max-h-[calc(100vh-6rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-10 duration-300">
            {/* Header */}
            <div className="bg-indigo-600 p-6 flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
                        <Brain size={24} className="animate-pulse" />
                    </div>
                    <div>
                        <h3 className="font-black text-white text-lg tracking-tight">AI Assistant</h3>
                        <p className="text-[10px] text-indigo-100 font-extrabold uppercase tracking-widest flex items-center gap-1.5 opacity-80">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Online
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all relative z-10"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-slate-950/40 custom-scrollbar">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`flex gap-3 max-w-[90%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${m.role === 'user'
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'}`}>
                                {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                            </div>
                            <div className={`p-4 rounded-[24px] text-sm leading-relaxed font-medium shadow-sm ${m.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-sm'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-sm'
                                }`}>
                                {m.content}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="flex gap-3 max-w-[90%]">
                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                                <Bot size={14} />
                            </div>
                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-[24px] rounded-tl-sm shadow-sm flex gap-1.5 items-center">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 relative">
                <div className="flex gap-3 relative items-center">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask me anything about your files..."
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-medium"
                    />
                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="bg-indigo-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all flex-shrink-0 shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                        <Send size={20} className={query.trim() ? "translate-x-0.5 -translate-y-0.5 transition-transform" : ""} />
                    </button>
                </div>
                <p className="text-[10px] text-center mt-4 font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
                    Powered by AI
                </p>
            </form>
        </div>
    );
};

export default AiChatInterface;
