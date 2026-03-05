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
                className="fixed bottom-10 right-10 bg-indigo-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-indigo-700 hover:-translate-y-1 transition-all z-50 flex items-center justify-center group active:scale-95"
            >
                <Sparkles size={24} className="text-white group-hover:scale-110 transition-transform" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-10 right-10 w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-10 duration-200">
            {/* Header */}
            <div className="bg-indigo-600 p-4 flex justify-between items-center relative overflow-hidden">
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-sm">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base tracking-tight">AI Assistant</h3>
                        <p className="text-xs text-indigo-100 font-medium">
                            Online
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all relative z-10"
                >
                    <X size={18} />
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
                            <div className={`p-3 rounded-2xl text-sm leading-relaxed font-medium shadow-sm ${m.role === 'user'
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
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 relative">
                <div className="flex justify-start gap-2 mb-3 overflow-x-auto pb-1 custom-scrollbar scrollbar-hide">
                    {['Summarize my documents', 'Find files about code', 'What did I upload recently?'].map((suggestion, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setQuery(suggestion)}
                            className="whitespace-nowrap px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2 relative items-center">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask about your files..."
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                    />
                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-all flex-shrink-0"
                    >
                        <Send size={16} className={query.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AiChatInterface;
