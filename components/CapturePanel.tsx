
import React, { useState, useEffect, useRef } from 'react';

interface CapturePanelProps {
  onProcess: (content: string) => Promise<void>;
  isLoading: boolean;
}

const CapturePanel: React.FC<CapturePanelProps> = ({ onProcess, isLoading }) => {
  const [content, setContent] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [learningStep, setLearningStep] = useState(0);
  const recognitionRef = useRef<any>(null);

  const steps = [
    "Distilling atomic concepts...",
    "Querying verification databases...",
    "Constructing Cornell framework...",
    "Brazing semantic connections...",
    "Synthesizing atomic insight..."
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setLearningStep(prev => (prev + 1) % steps.length);
      }, 1500);
    } else {
      setLearningStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const toggleVoice = () => {
    if (isVoiceActive) {
      recognitionRef.current?.stop();
      setIsVoiceActive(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech recognition not supported in this browser.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setContent(prev => prev.split('... (Listening)')[0] + transcript);
      };

      recognition.onerror = () => setIsVoiceActive(false);
      recognition.onend = () => setIsVoiceActive(false);

      recognition.start();
      recognitionRef.current = recognition;
      setIsVoiceActive(true);
      setContent(prev => (prev ? prev + '\n' : '') + '... (Listening)');
    }
  };

  const handleClipURL = async () => {
    const url = prompt("Paste a research URL to summarize and architect:");
    if (url) {
      setContent(prev => (prev ? prev + '\n' : '') + `[URL CLIP: ${url}]\nSynthesizing content from this source...`);
      // Gemini will handle the [URL CLIP] marker in the processing service
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;
    await onProcess(content);
    setContent('');
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-4 sm:p-8 note-card">
      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-slate-200/60 overflow-hidden relative">
        
        {isLoading && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 sm:p-12 text-center">
            <div className="relative mb-10">
              <div className="w-20 h-20 sm:w-24 sm:h-24 border-[6px] border-indigo-100 rounded-full"></div>
              <div className="w-20 h-20 sm:w-24 sm:h-24 border-[6px] border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <i className="fas fa-brain text-xl sm:text-2xl text-indigo-600 animate-pulse"></i>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Architecting Knowledge</h3>
            <p className="text-indigo-600 font-mono text-[10px] font-bold uppercase tracking-[0.2em]">{steps[learningStep]}</p>
          </div>
        )}

        <div className="p-6 sm:p-12 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
               <span className={`w-2 h-2 rounded-full ${isVoiceActive ? 'bg-red-500 animate-ping' : 'bg-indigo-500 animate-pulse'}`}></span>
               <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                 {isVoiceActive ? 'Voice Intelligence Active' : 'Active Capture'}
               </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Rapid Capture</h2>
          </div>
          <div className="flex gap-3">
             <button 
                onClick={toggleVoice}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
                  isVoiceActive ? 'bg-red-500 text-white shadow-red-200' : 'bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
                title="Voice Thinking"
             >
                <i className={`fas ${isVoiceActive ? 'fa-stop' : 'fa-microphone'} text-lg sm:text-xl`}></i>
             </button>
             <button 
                onClick={handleClipURL}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center shadow-sm" 
                title="Clip URL"
             >
                <i className="fas fa-link text-lg sm:text-xl"></i>
             </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 sm:p-12 pt-4 sm:pt-8">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Dump your fleeting notes, rough sketches, research strings, or paste URLs..."
              className={`w-full h-60 sm:h-72 p-6 sm:p-10 bg-slate-50/50 rounded-[1.5rem] sm:rounded-[2.5rem] border-2 border-transparent focus:border-indigo-100 focus:bg-white focus:outline-none text-lg sm:text-xl text-slate-700 placeholder:text-slate-300 font-medium transition-all resize-none leading-relaxed ${isVoiceActive ? 'italic text-indigo-500' : ''}`}
              disabled={isLoading}
            />
            {!content && (
              <div className="hidden sm:flex absolute bottom-8 right-10 gap-4 opacity-30 pointer-events-none">
                 <span className="text-[10px] font-black uppercase tracking-widest">Shift + Enter to process</span>
              </div>
            )}
          </div>
          
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
               <div className="flex -space-x-3">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                     <i className="fas fa-check text-[10px]"></i>
                   </div>
                 ))}
               </div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                 Validated By<br/>Knowledge Engine
               </div>
            </div>
            
            <button
              type="submit"
              disabled={!content.trim() || isLoading}
              className={`w-full sm:w-auto group flex items-center justify-center gap-4 px-10 py-5 sm:px-12 sm:py-6 rounded-2xl sm:rounded-[2rem] font-black text-[10px] sm:text-xs uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 ${
                isLoading || !content.trim()
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-2'
              }`}
            >
              Learn & Structure
              <i className="fas fa-chevron-right group-hover:translate-x-1 transition-transform"></i>
            </button>
          </div>
        </form>
      </div>

      {/* Feature Badges */}
      <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {[
          { icon: 'fa-shield-halved', label: 'Verify', desc: 'Auto Fact-Check' },
          { icon: 'fa-layer-group', label: 'Structure', desc: 'Cornell Matrix' },
          { icon: 'fa-network-wired', label: 'Connect', desc: 'Backlink Engine' },
          { icon: 'fa-feather', label: 'Atomic', desc: 'Insight Extraction' }
        ].map((feat, i) => (
          <div key={i} className="bg-white/40 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-white flex items-center gap-4 group hover:bg-white hover:shadow-xl transition-all cursor-default">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <i className={`fas ${feat.icon} text-sm`}></i>
            </div>
            <div className="hidden sm:block">
              <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">{feat.label}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CapturePanel;
