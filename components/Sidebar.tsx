
import React, { useState, useEffect } from 'react';
import { Note, NoteCategory } from '../types';
import { getRelatedKeywords } from '../services/geminiService';

interface SidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onNoteSelect: (id: string) => void;
  onNewNote: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  onSyncEmail: () => void;
  isSyncing: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  notes,
  activeNoteId,
  onNoteSelect,
  onNewNote,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  onSyncEmail,
  isSyncing,
  isOpen,
  onToggle
}) => {
  const categories = Object.values(NoteCategory);
  const [copied, setCopied] = useState(false);
  const [relatedKeywords, setRelatedKeywords] = useState<string[]>([]);
  const [isExpanding, setIsExpanding] = useState(false);
  const captureEmail = "capture-7a2f@cogninote.io";

  // Semantic Keyword Expansion Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsExpanding(true);
        const keywords = await getRelatedKeywords(searchQuery);
        setRelatedKeywords(keywords);
        setIsExpanding(false);
      } else {
        setRelatedKeywords([]);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCopy = () => {
    navigator.clipboard.writeText(captureEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredNotes = notes.filter(note => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = note.title.toLowerCase().includes(query) ||
                         note.tags.some(tag => tag.toLowerCase().includes(query)) ||
                         note.cornell.summary.toLowerCase().includes(query);
    const matchesCategory = !selectedCategory || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-slate-200 flex flex-col shadow-[20px_0_60px_-15px_rgba(0,0,0,0.05)]
    transition-transform duration-300 ease-in-out md:relative md:translate-x-0
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Sidebar Header */}
        <div className="p-8 pb-4 sm:p-10 sm:pb-6">
          <div className="flex items-center justify-between mb-8 sm:mb-10">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200 rotate-3">
                <i className="fas fa-brain text-sm sm:text-lg"></i>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tighter">CogniNote</h1>
                <span className="text-[8px] sm:text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em]">PRO SYSTEM</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onNewNote}
                className="w-10 h-10 bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-400 rounded-xl transition-all flex items-center justify-center hover:-translate-y-1 hover:shadow-lg"
              >
                <i className="fas fa-plus"></i>
              </button>
              <button onClick={onToggle} className="md:hidden w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center">
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          {/* Intelligent Search Input */}
          <div className="relative mb-2 group">
            <i className={`fas ${isExpanding ? 'fa-circle-notch animate-spin text-indigo-500' : 'fa-search text-slate-300'} absolute left-4 top-1/2 -translate-y-1/2 text-sm transition-colors`}></i>
            <input
              type="text"
              placeholder="Query Intelligence..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 sm:py-4 bg-slate-50 border border-transparent rounded-2xl text-[12px] sm:text-[13px] font-bold focus:outline-none focus:bg-white focus:border-indigo-100 transition-all placeholder:text-slate-300"
            />
          </div>

          {/* Neural Expansion Tags */}
          <div className="mb-6 h-10 overflow-hidden">
             {relatedKeywords.length > 0 && (
               <div className="flex gap-2 overflow-x-auto no-scrollbar animate-slideIn">
                 <span className="shrink-0 flex items-center text-[7px] font-black text-indigo-400 uppercase tracking-widest px-1">
                   <i className="fas fa-sparkles mr-1"></i>
                 </span>
                 {relatedKeywords.map((keyword, i) => (
                   <button
                    key={i}
                    onClick={() => onSearchChange(keyword)}
                    className="shrink-0 px-3 py-1 bg-indigo-50/50 border border-indigo-100/50 rounded-full text-[8px] font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all animate-pulse"
                    style={{ animationDelay: `${i * 100}ms` }}
                   >
                     {keyword}
                   </button>
                 ))}
               </div>
             )}
          </div>

          {/* Navigation Categories (MOC) */}
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            <button
              onClick={() => onCategorySelect(null)}
              className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                !selectedCategory ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
            >
              All Notes
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => onCategorySelect(cat)}
                className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  selectedCategory === cat ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Index Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6">
          <div className="space-y-2">
            <div className="px-4 py-2 mb-2 flex items-center justify-between">
               <h3 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Table of Contents</h3>
               <button 
                  onClick={onSyncEmail}
                  disabled={isSyncing}
                  className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors ${isSyncing ? 'text-indigo-400 animate-pulse' : 'text-slate-400 hover:text-indigo-600'}`}
                >
                 <i className={`fas fa-sync-alt ${isSyncing ? 'animate-spin' : ''}`}></i>
                 {isSyncing ? 'Syncing' : 'Sync Mail'}
               </button>
            </div>
            
            {filteredNotes.length === 0 ? (
              <div className="py-20 text-center opacity-40">
                <i className="fas fa-scroll text-3xl mb-4"></i>
                <p className="text-[10px] font-black uppercase tracking-widest">Nothing indexed yet</p>
              </div>
            ) : (
              filteredNotes.map(note => (
                <button
                  key={note.id}
                  onClick={() => {
                    onNoteSelect(note.id);
                    if (window.innerWidth < 768) onToggle();
                  }}
                  className={`w-full text-left p-4 sm:p-5 rounded-[1.5rem] transition-all group relative overflow-hidden ${
                    activeNoteId === note.id
                      ? 'bg-indigo-50/50 border border-indigo-100'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  {activeNoteId === note.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600"></div>
                  )}
                  <div className="flex items-center gap-3 mb-2">
                     <div className={`w-2 h-2 rounded-full ${activeNoteId === note.id ? 'bg-indigo-600 animate-pulse' : 'bg-slate-200'}`}></div>
                     <span className="text-[9px] font-bold text-slate-400 font-mono">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className={`font-extrabold text-[12px] sm:text-[13px] mb-3 leading-snug tracking-tight ${activeNoteId === note.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {note.title}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {note.tags.slice(0, 2).map(t => (
                      <span key={t} className="text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 bg-white border border-slate-100 rounded text-slate-400 group-hover:text-indigo-600 transition-colors">
                        {t}
                      </span>
                    ))}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Footer: Email Forwarding Integration */}
        <div className="p-6 sm:p-8 border-t border-slate-50 space-y-4">
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-indigo-600">
                <i className="fas fa-envelope-open-text text-xs"></i>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Email Capture</p>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 truncate">{captureEmail}</p>
              </div>
            </div>
            <button 
              onClick={handleCopy}
              className="w-full py-2 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-100 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm"
            >
              {copied ? 'Copied!' : 'Copy Address'}
            </button>
          </div>

          <div className="p-4 sm:p-5 bg-slate-900 rounded-[2rem] shadow-2xl flex items-center gap-4 group cursor-pointer overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <i className="fas fa-brain text-xs sm:text-sm"></i>
            </div>
            <div className="z-10">
              <p className="text-[8px] sm:text-[9px] font-black text-indigo-400 uppercase tracking-widest">Collections</p>
              <p className="text-xs sm:text-sm font-black text-white">{notes.length}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
