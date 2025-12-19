
import React, { useState } from 'react';
import { Note } from '../types';
import { askGeminiAboutNote } from '../services/geminiService';

interface CornellNoteProps {
  note: Note;
  onDelete: (id: string) => void;
  onLinkClick: (title: string) => void;
  onUpdateMastery: (id: string, score: number) => void;
}

const CornellNote: React.FC<CornellNoteProps> = ({ note, onDelete, onLinkClick, onUpdateMastery }) => {
  const [reviewMode, setReviewMode] = useState(false);
  const [chatPrompt, setChatPrompt] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isEmailing, setIsEmailing] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const formatNoteForSharing = () => {
    return `CogniNote: ${note.title}\nCategory: ${note.category}\n\nSUMMARY: ${note.cornell.summary}\n\nCUES: ${note.cornell.cues.join(', ')}\n\nNOTES:\n${note.cornell.notes}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formatNoteForSharing());
    setCopyStatus("Copied!");
    setTimeout(() => setCopyStatus(null), 2000);
    setShowShareMenu(false);
  };

  const handleUpdateMastery = (amt: number) => {
    const newScore = Math.min(100, Math.max(0, note.masteryScore + amt));
    onUpdateMastery(note.id, newScore);
  };

  const handleAskGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatPrompt.trim() || isChatLoading) return;
    const userMsg = chatPrompt;
    setChatPrompt('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);
    try {
      const context = `Title: ${note.title}\nNotes: ${note.cornell.notes}`;
      const response = await askGeminiAboutNote(userMsg, context);
      setChatHistory(prev => [...prev, { role: 'ai', text: response }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto custom-scrollbar h-full p-4 sm:p-12 transition-all duration-700 ${reviewMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-5xl mx-auto">
        
        {/* Progress HUD */}
        <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-6">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                    <svg className="w-full h-full -rotate-90">
                        <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                        <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#4f46e5" strokeWidth="6" strokeDasharray="220" strokeDashoffset={220 - (2.2 * note.masteryScore)} strokeLinecap="round" className="transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-xs font-black ${reviewMode ? 'text-white' : 'text-slate-900'}`}>{note.masteryScore}%</span>
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Mastery</span>
                    </div>
                </div>
                <div>
                   <h2 className={`text-3xl sm:text-4xl font-black tracking-tighter ${reviewMode ? 'text-white' : 'text-slate-900'}`}>
                    {note.title}
                   </h2>
                   <div className="flex gap-2 mt-2">
                     <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {note.isSeed ? 'Research Seed' : 'Atomic Knowledge'}
                     </span>
                   </div>
                </div>
            </div>

            <div className="flex gap-3">
                <button 
                  onClick={() => setReviewMode(!reviewMode)}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl ${
                    reviewMode ? 'bg-indigo-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <i className={`fas ${reviewMode ? 'fa-eye' : 'fa-brain-circuit'} mr-2`}></i>
                  {reviewMode ? 'End Session' : 'Mastery Mode'}
                </button>
            </div>
        </div>

        {/* The Cornell Board */}
        <div className={`bg-white rounded-[2.5rem] border shadow-2xl overflow-hidden transition-all duration-500 ${reviewMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200'}`}>
           <div className="grid grid-cols-1 md:grid-cols-[300px_1fr]">
              {/* Cues Area */}
              <div className={`p-10 border-r ${reviewMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50/20'}`}>
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Recall Cues</h3>
                 <div className="space-y-8">
                    {note.cornell.cues.map((cue, i) => (
                        <div key={i} className="group">
                            <p className={`text-lg font-bold leading-tight transition-colors ${reviewMode ? 'text-indigo-300' : 'text-slate-800 group-hover:text-indigo-600'}`}>{cue}</p>
                            <div className="w-8 h-1 bg-indigo-100 mt-4 group-hover:w-full transition-all"></div>
                        </div>
                    ))}
                 </div>
              </div>

              {/* Notes Area */}
              <div className={`p-10 sm:p-14 ${reviewMode ? 'opacity-20 blur-xl pointer-events-none' : 'opacity-100 blur-0'}`}>
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10">Neural Architecture</h3>
                 <div className="prose prose-slate max-w-none text-lg text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                    {note.cornell.notes}
                 </div>
              </div>
           </div>

           {/* Summary Section */}
           <div className={`p-10 border-t ${reviewMode ? 'bg-indigo-900/10 border-slate-800' : 'bg-indigo-600 text-white'}`}>
                <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${reviewMode ? 'text-indigo-400' : 'text-indigo-200'}`}>Atomic Logic</h3>
                <p className="text-xl font-bold italic leading-relaxed">"{note.cornell.summary}"</p>
           </div>
        </div>

        {/* Post-Session Mastery Check */}
        {reviewMode && (
            <div className="mt-12 p-10 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col items-center text-center animate-slideIn">
                <h3 className="text-white text-xl font-black mb-6">How was your recall?</h3>
                <div className="flex gap-6">
                    <button onClick={() => { handleUpdateMastery(-5); setReviewMode(false); }} className="px-8 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">Struggled</button>
                    <button onClick={() => { handleUpdateMastery(10); setReviewMode(false); }} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 shadow-2xl shadow-indigo-900 transition-all">Mastered</button>
                </div>
            </div>
        )}

        {/* Intelligence Query */}
        {!reviewMode && (
            <div className="mt-12 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center"><i className="fas fa-sparkles"></i></div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em]">Deepen Understanding</h3>
                </div>
                <div className="space-y-4 mb-8 max-h-60 overflow-y-auto custom-scrollbar">
                    {chatHistory.map((c, i) => (
                        <div key={i} className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${c.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'}`}>
                                {c.text}
                            </div>
                        </div>
                    ))}
                </div>
                <form onSubmit={handleAskGemini} className="flex gap-4">
                    <input 
                        type="text" 
                        value={chatPrompt} 
                        onChange={(e) => setChatPrompt(e.target.value)} 
                        placeholder="Ask Gemini to synthesize, challenge, or expand..." 
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button type="submit" disabled={isChatLoading} className="px-8 py-4 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 disabled:opacity-50 transition-all">Query</button>
                </form>
            </div>
        )}
      </div>
    </div>
  );
};

export default CornellNote;
