
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CapturePanel from './components/CapturePanel';
import CornellNote from './components/CornellNote';
import GraphView from './components/GraphView';
import { Note, NoteCategory, AppView } from './types';
import { processInformation } from './services/geminiService';

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSyncingEmail, setIsSyncingEmail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('notebook');

  useEffect(() => {
    const saved = localStorage.getItem('cogninote_v4_data');
    if (saved) setNotes(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('cogninote_v4_data', JSON.stringify(notes));
  }, [notes]);

  const handleProcess = async (rawInput: string, isSeed: boolean = false) => {
    setIsProcessing(true);
    try {
      const context = notes.slice(0, 15).map(n => n.title).join(', ');
      const result = await processInformation(rawInput, context, isSeed);
      
      const newNote: Note = {
        id: crypto.randomUUID(),
        title: result.title,
        rawInput,
        category: result.category as NoteCategory,
        tags: result.tags,
        cornell: result.cornell,
        validation: result.validation,
        connections: result.connections.map((c: any) => ({ ...c, id: crypto.randomUUID() })),
        masteryScore: isSeed ? 0 : 20,
        lastReviewed: Date.now(),
        isSeed,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setNotes(prev => [newNote, ...prev]);
      setActiveNoteId(newNote.id);
      setIsCapturing(false);
      setCurrentView('notebook');
    } catch (err) {
      console.error(err);
      alert("Intelligence engine encountered an architectural barrier.");
    } finally {
      setIsProcessing(false);
    }
  };

  const updateMastery = (id: string, score: number) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, masteryScore: score, lastReviewed: Date.now() } : n));
  };

  const handleSyncEmail = async () => {
    if (isSyncingEmail) return;
    setIsSyncingEmail(true);
    await new Promise(r => setTimeout(r, 1500));
    await handleProcess("Fwd: Research on Neural Plasticity. We need a summary of how physical exercise affects hippocampal volume in adults.");
    setIsSyncingEmail(false);
  };

  const handleLinkClick = async (title: string) => {
    const found = notes.find(n => n.title.toLowerCase().includes(title.toLowerCase()));
    if (found) {
      setActiveNoteId(found.id);
      setCurrentView('notebook');
    } else {
      if (confirm(`Topic "${title}" is unexplored. Initialize a Research Seed?`)) {
        handleProcess(`I want to learn about: ${title}`, true);
      }
    }
  };

  const activeNote = notes.find(n => n.id === activeNoteId);
  const avgMastery = notes.length ? Math.round(notes.reduce((acc, n) => acc + n.masteryScore, 0) / notes.length) : 0;

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-900 overflow-hidden paper-texture">
      <Sidebar
        notes={notes}
        activeNoteId={activeNoteId}
        onNoteSelect={(id) => { setActiveNoteId(id); setIsCapturing(false); setCurrentView('notebook'); }}
        onNewNote={() => { setIsCapturing(true); setActiveNoteId(null); }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        onSyncEmail={handleSyncEmail}
        isSyncing={isSyncingEmail}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className="flex-1 relative flex flex-col min-w-0">
        <header className="flex items-center justify-between px-12 py-6 bg-white border-b border-slate-200 z-20">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden"><i className="fas fa-bars"></i></button>
            <nav className="flex bg-slate-100 p-1.5 rounded-2xl gap-2">
               <button onClick={() => setCurrentView('notebook')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${currentView === 'notebook' ? 'bg-white shadow-sm' : 'text-slate-400'}`}>
                Notebook
               </button>
               <button onClick={() => setCurrentView('graph')} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${currentView === 'graph' ? 'bg-white shadow-sm' : 'text-slate-400'}`}>
                Brain Map
               </button>
            </nav>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Vitality</span>
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${avgMastery}%` }}></div>
                </div>
                <span className="text-[10px] font-black text-indigo-600">{avgMastery}%</span>
             </div>
             <button onClick={() => { setIsCapturing(true); setActiveNoteId(null); }} className="w-10 h-10 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
                <i className="fas fa-plus"></i>
             </button>
          </div>
        </header>

        {currentView === 'graph' ? (
          <GraphView notes={notes} onNoteSelect={(id) => { setActiveNoteId(id); setCurrentView('notebook'); }} />
        ) : isCapturing || (notes.length === 0 && !activeNoteId) ? (
          <div className="flex-1 overflow-y-auto p-12">
            <CapturePanel onProcess={(c) => handleProcess(c, false)} isLoading={isProcessing} />
          </div>
        ) : activeNote ? (
          <CornellNote 
            note={activeNote} 
            onDelete={(id) => { setNotes(notes.filter(n => n.id !== id)); setActiveNoteId(null); }} 
            onLinkClick={handleLinkClick}
            onUpdateMastery={updateMastery}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20">
             <i className="fas fa-scroll text-5xl mb-6"></i>
             <p className="font-black uppercase tracking-widest">Select Concept</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
