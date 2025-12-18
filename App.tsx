
import React, { useState, useEffect, useRef } from 'react';
import {
  Zap, Cpu, Trash2, Terminal as TerminalIcon, Sparkles, Send, Key, Loader2, FileText, ChevronRight
} from 'lucide-react';
import { NodeId, FlowStatus, Store, ViewMode } from './types';
import { STATIC_NODES_CONFIG, QUESTION_BANK, QID_MAPPING } from './constants';
import { GeminiService } from './services/geminiService';
import { NodeCard } from './components/NodeCard';
import { JsonArtifact } from './components/JsonArtifact';
import { EliteReport } from './components/EliteReport';

const App: React.FC = () => {
  const [brief, setBrief] = useState('');
  const [status, setStatus] = useState<FlowStatus>(FlowStatus.IDLE);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [checkingKey, setCheckingKey] = useState(true);
  const [store, setStore] = useState<Store>({
    artifacts: {},
    paradigm: { partial: {} },
    logs: [],
    viewMode: 'LAB'
  });
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, string>>({});

  const serviceRef = useRef<GeminiService | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      // Priorité à la clé injectée via l'environnement (Vite)
      if (process.env.API_KEY) {
        setHasApiKey(true);
        setCheckingKey(false);
        return;
      }

      const aiStudio = (window as any).aistudio;
      if (aiStudio) {
        const selected = await aiStudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
      setCheckingKey(false);
    };
    checkKey();
  }, []);

  useEffect(() => {
    if (hasApiKey) {
      try {
        serviceRef.current = new GeminiService();
      } catch (e) {
        console.error("Critical: Could not initialize GeminiService", e);
      }
    }
  }, [hasApiKey]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [store.logs]);

  const selectKey = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio) {
      await aiStudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const addLog = (msg: string) => {
    setStore(p => ({ ...p, logs: [...p.logs, `[${new Date().toLocaleTimeString()}] ${msg}`] }));
  };

  const updateNode = (id: NodeId, s: string) => {
    setNodeStatuses(prev => ({ ...prev, [id]: s }));
  };

  const updateNestedPath = (obj: any, path: string, value: any) => {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (i === keys.length - 1) {
        if (Array.isArray(current[key])) {
          current[key].push(value);
        } else {
          current[key] = value;
        }
      } else {
        if (!current[key]) current[key] = {};
        current = current[key];
      }
    }
  };

  // Callback pour stocker l'image générée dans l'artefact COPYWRITING_MASTER
  const handleAdImageGenerated = (index: number, url: string) => {
    setStore(prev => {
      const currentAds = [...(prev.artifacts[NodeId.COPYWRITING_MASTER] || [])];
      if (currentAds[index]) {
        currentAds[index] = { ...currentAds[index], image_url: url };
      }
      return {
        ...prev,
        artifacts: {
          ...prev.artifacts,
          [NodeId.COPYWRITING_MASTER]: currentAds
        }
      };
    });
  };

  const runProtocol = async () => {
    if (!brief || !serviceRef.current) return;

    setStatus(FlowStatus.RUNNING);
    setStore(p => ({ ...p, artifacts: {}, paradigm: { partial: {} }, logs: [], viewMode: 'LAB' }));

    const initialStatuses: Record<string, string> = {};
    STATIC_NODES_CONFIG.forEach(n => initialStatuses[n.id] = 'pending');
    setNodeStatuses(initialStatuses);

    const results: Record<string, any> = {};
    const execute = async (id: NodeId, name: string, fn: () => Promise<any>) => {
      updateNode(id, 'active');
      addLog(`ACTIVATION : Protocole ${name}...`);
      try {
        const res = await fn();
        results[id] = res;
        setStore(prev => ({ ...prev, artifacts: { ...prev.artifacts, [id]: res } }));
        addLog(`SUCCÈS : Artefact ${name} sécurisé.`);
        updateNode(id, 'done');
        return res;
      } catch (e: any) {
        addLog(`ERREUR CRITIQUE ${name} : ${e.message}`);
        updateNode(id, 'error');
        if (e.message?.includes("Requested entity was not found")) {
          setHasApiKey(false);
        }
        throw e;
      }
    };

    try {
      await execute(NodeId.RAW_INPUT, "Raw Scan", async () => ({ brief, timestamp: new Date().toISOString() }));
      const biz = await execute(NodeId.BUSINESS_EXTRACTOR, "Extracteur Business", async () => await serviceRef.current!.analyzeBusiness(brief));
      const avatar = await execute(NodeId.AVATAR_BUILDER, "Construction Avatar (Thinking: 32K)", async () => await serviceRef.current!.buildAvatar(biz));

      await execute(NodeId.INTERVIEW_SIMULATOR, "Interview Neurale", async () => {
        const transcript = [];
        const currentParadigm = { ...store.paradigm.partial };
        for (const q of QUESTION_BANK) {
          const res = await serviceRef.current!.simulateAvatarResponse(q.text, avatar);
          transcript.push({ q: q.text, a: res.answer });
          const paths = QID_MAPPING[q.qid];
          if (paths && res.answer) {
            paths.forEach(path => updateNestedPath(currentParadigm, path, res.answer));
          }
        }
        return { mapped_paradigm: currentParadigm, transcript };
      });

      const personas = await execute(NodeId.PERSONA_SPLITTER, "Segmentation Audience", async () => await serviceRef.current!.splitPersonas(avatar));
      const awareness = await execute(NodeId.AWARENESS_DETECTOR, "Radar Conscience", async () => await serviceRef.current!.detectAwareness(brief));
      const strategy = await execute(NodeId.OFFER_STRATEGIST, "Forge Stratégique (Pro Thinking)", async () => await serviceRef.current!.generateStrategy(awareness, biz));
      const interests = await execute(NodeId.INTEREST_LAB, "Labo Intérêts (Web Grounding)", async () => await serviceRef.current!.researchInterests(`${brief} target audience Meta Ads interests`));

      await execute(NodeId.INTEREST_CLUSTER, "Cluster Meta (Thinking: 32K)", async () => await serviceRef.current!.clusterInterests(interests.text));

      updateNode(NodeId.COPYWRITING_MASTER, 'active');
      const ads = [];
      for (const p of personas) {
        addLog(`Rédaction créative pour ${p.nom}...`);
        const ad = await serviceRef.current!.generateCopy(p, strategy.angle);
        ads.push(ad);
        results[NodeId.COPYWRITING_MASTER] = [...ads];
        setStore(prev => ({ ...prev, artifacts: { ...prev.artifacts, [NodeId.COPYWRITING_MASTER]: [...ads] } }));
      }
      updateNode(NodeId.COPYWRITING_MASTER, 'done');

      await execute(NodeId.AUDIENCE_ADVISOR, "Config Meta Technique", async () => await serviceRef.current!.generateMetaConfig(biz, strategy));

      await execute(NodeId.CAMPAIGN_ASSEMBLER, "Dossier Elite Compilation", async () => {
        addLog("Synthèse neurale en cours...");
        const finalMd = await serviceRef.current!.generateFinalDossier(results);
        return { content: finalMd, summary: "Dossier Elite finalisé." };
      });

      setStatus(FlowStatus.COMPLETED);
      addLog("MISSION ACCOMPLIE : Système Vanguard prêt pour revue Elite.");
    } catch (e: any) {
      console.error(e);
      setStatus(FlowStatus.FAILED);
    }
  };

  const toggleViewMode = () => {
    setStore(p => ({ ...p, viewMode: p.viewMode === 'LAB' ? 'DOSSIER' : 'LAB' }));
  };

  if (checkingKey) {
    return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 text-cyan-500 animate-spin" /></div>;
  }

  if (!hasApiKey) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-cyan-500/10 p-4 rounded-full mb-8 border border-cyan-500/20"><Key className="w-12 h-12 text-cyan-500" /></div>
        <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">API KEY REQUIRED</h1>
        <button onClick={selectKey} className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl transition-all">SELECT API KEY</button>
      </div>
    );
  }

  if (store.viewMode === 'DOSSIER' && store.artifacts[NodeId.CAMPAIGN_ASSEMBLER]) {
    return <EliteReport artifacts={store.artifacts} onBack={toggleViewMode} />;
  }

  return (
    <div className="h-screen bg-[#050505] text-slate-200 font-sans flex flex-col overflow-hidden relative">
      <div className="scanline" />
      <header className="border-b border-white/[0.05] bg-black/60 backdrop-blur-2xl px-8 py-5 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-5">
          <div className="bg-cyan-950/40 p-2.5 rounded-lg border border-cyan-500/30"><Zap className="w-6 h-6 text-cyan-400" /></div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">VANGUARD <span className="text-cyan-500">REALITY</span></h1>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.5em] mt-1.5 opacity-60">Protocol V7.1 // Pro AI Integration</p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          {status === FlowStatus.COMPLETED && (
            <button onClick={toggleViewMode} className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-cyan-900/20 flex items-center animate-in zoom-in-90 transition-all">
              <FileText className="w-4 h-4 mr-2" /> Dossier Elite <ChevronRight className="w-3 h-3 ml-2" />
            </button>
          )}
          <button onClick={() => window.location.reload()} className="text-[10px] text-gray-600 hover:text-red-400 transition-colors uppercase font-black tracking-widest flex items-center group"><Trash2 className="w-4 h-4 mr-2" /> Reset</button>
          <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] transition-all ${status === FlowStatus.RUNNING ? 'border-cyan-500/40 bg-cyan-950/20 text-cyan-400 animate-pulse' : status === FlowStatus.COMPLETED ? 'border-green-500/40 bg-green-950/20 text-green-400' : 'border-gray-800 bg-gray-900/50 text-gray-600'}`}>
            {status}
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 overflow-hidden">
        <div className="col-span-3 border-r border-white/[0.05] bg-black/30 p-6 space-y-3 overflow-y-auto custom-scrollbar">
          <div className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-500 mb-6 px-3 flex items-center">
            <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3 animate-pulse" /> Operational Pipeline
          </div>
          {STATIC_NODES_CONFIG.map(n => (
            <NodeCard key={n.id} node={n} status={nodeStatuses[n.id] || 'pending'} isActive={nodeStatuses[n.id] === 'active'} />
          ))}
        </div>

        <div className="col-span-6 bg-[#080808] relative flex flex-col overflow-hidden">
          {status === FlowStatus.IDLE ? (
            <div className="flex-1 flex flex-col justify-center items-center p-16 animate-in fade-in zoom-in-95 duration-700">
              <Cpu className="w-12 h-12 text-cyan-500 mb-10 opacity-80" />
              <h2 className="text-6xl font-black uppercase tracking-tighter text-white mb-8 text-center leading-[0.9]">Activate <br /><span className="text-cyan-600">Reality Protocol</span></h2>
              <div className="w-full max-w-2xl relative mt-4 group">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-3xl blur opacity-10 group-hover:opacity-30 transition duration-1000"></div>
                <div className="relative">
                  <textarea value={brief} onChange={e => setBrief(e.target.value)} placeholder="Décrivez votre produit ou collez une URL pour analyse profonde..." className="w-full bg-black/60 border border-white/10 min-h-[140px] p-6 rounded-3xl focus:ring-1 focus:ring-cyan-500 outline-none text-lg font-medium text-white placeholder:text-gray-700 transition-all shadow-2xl resize-none" />
                  <button onClick={runProtocol} disabled={!brief} className="absolute right-4 bottom-4 h-14 w-14 bg-cyan-600 rounded-2xl flex items-center justify-center text-white hover:bg-cyan-500 transition-all disabled:opacity-30 disabled:grayscale shadow-lg shadow-cyan-900/40"><Send className="w-6 h-6" /></button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-10 scroll-smooth custom-scrollbar">
              {Object.entries(store.artifacts).map(([key, data]) => (
                <JsonArtifact key={key} title={key} data={data} service={serviceRef.current!} onAdImageGenerated={handleAdImageGenerated} />
              ))}
              <div className="h-32" />
            </div>
          )}
        </div>

        <div className="col-span-3 bg-black/80 backdrop-blur-md border-l border-white/[0.05] flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center space-x-3 text-[11px] text-gray-400 font-black uppercase tracking-widest">
              <TerminalIcon className="w-4 h-4 text-cyan-600" /> <span>Neural Activity</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-3 font-mono text-[10px] custom-scrollbar">
            {store.logs.map((log, i) => (
              <div key={i} className="text-gray-500 border-l border-white/10 pl-4 py-0.5 leading-relaxed group hover:border-cyan-500/40 transition-colors">
                <span className="text-cyan-800 mr-3 font-black">&gt;&gt;</span>
                <span className="group-hover:text-gray-300 transition-colors">{log}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
