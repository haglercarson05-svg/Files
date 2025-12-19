
import React from 'react';
import { Note } from '../types';

interface GraphViewProps {
  notes: Note[];
  onNoteSelect: (id: string) => void;
}

const GraphView: React.FC<GraphViewProps> = ({ notes, onNoteSelect }) => {
  return (
    <div className="flex-1 h-full bg-[#050810] relative overflow-hidden flex items-center justify-center p-8">
      {/* Background Neural Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
      
      <div className="z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {notes.length === 0 ? (
          <div className="col-span-full text-center py-20">
             <div className="w-24 h-24 bg-slate-800/50 rounded-[2.5rem] flex items-center justify-center text-slate-600 mx-auto mb-6">
                <i className="fas fa-brain-circuit text-3xl"></i>
             </div>
             <h2 className="text-2xl font-black text-white uppercase tracking-widest">Neural Network Offline</h2>
             <p className="text-slate-500 mt-2 font-medium">Capture your first atomic insight to initialize the map.</p>
          </div>
        ) : (
          notes.map(note => {
            const masteryColor = note.masteryScore > 80 ? 'border-indigo-500 shadow-indigo-500/20' : 
                               note.masteryScore > 40 ? 'border-emerald-500/50 shadow-emerald-500/10' : 
                               'border-slate-800 shadow-none';
            
            return (
              <button
                key={note.id}
                onClick={() => onNoteSelect(note.id)}
                className={`relative group p-8 bg-slate-900/60 backdrop-blur-xl border rounded-[2rem] text-left transition-all hover:-translate-y-2 hover:bg-slate-800 ${masteryColor}`}
              >
                {/* Connection Pulse */}
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black text-white ${note.masteryScore > 80 ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                    {note.connections.length}
                </div>

                <div className="flex flex-col h-full">
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">
                    {note.category}
                  </span>
                  <h3 className="text-lg font-black text-white leading-tight mb-6 line-clamp-2">
                    {note.title}
                  </h3>
                  
                  <div className="mt-auto flex items-center justify-between">
                     <div className="flex gap-1">
                        {Array.from({length: 5}).map((_, i) => (
                           <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < (note.masteryScore / 20) ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
                        ))}
                     </div>
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        {note.masteryScore}% Mastery
                     </span>
                  </div>
                </div>

                {/* Simulated Neural Link Lines (Visual Only) */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="absolute top-1/2 left-full w-20 h-[1px] bg-gradient-to-r from-indigo-500 to-transparent"></div>
                   <div className="absolute top-1/2 right-full w-20 h-[1px] bg-gradient-to-l from-indigo-500 to-transparent"></div>
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* Stats Overlay */}
      <div className="absolute bottom-10 left-10 p-6 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl hidden xl:block">
         <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Neural Overview</h4>
         <div className="space-y-3">
            <div className="flex justify-between gap-12">
               <span className="text-xs text-slate-400 font-bold">Total Concepts</span>
               <span className="text-xs text-white font-black">{notes.length}</span>
            </div>
            <div className="flex justify-between gap-12">
               <span className="text-xs text-slate-400 font-bold">Synaptic Connections</span>
               <span className="text-xs text-white font-black">{notes.reduce((acc, n) => acc + n.connections.length, 0)}</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default GraphView;
