
import React from 'react';
import { FileJson, PenTool, Link as LinkIcon, Globe, Layers, Crosshair, TrendingUp, CheckCircle } from 'lucide-react';
import { NodeId } from '../types';
import { AdMockup } from './AdMockup';
import { GeminiService } from '../services/geminiService';

interface JsonArtifactProps {
  title: string;
  data: any;
  service: GeminiService;
  onAdImageGenerated?: (index: number, url: string) => void;
}

export const JsonArtifact: React.FC<JsonArtifactProps> = ({ title, data, service, onAdImageGenerated }) => {
  // Rendu Copywriting
  if (title === NodeId.COPYWRITING_MASTER && Array.isArray(data)) {
    return (
      <div className="space-y-6 mb-12">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <PenTool className="w-4 h-4 text-cyan-500" />
          </div>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Creative Output Engine</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.map((ad, i) => (
            <AdMockup key={i} index={i} ad={ad} service={service} onImageGenerated={onAdImageGenerated} />
          ))}
        </div>
      </div>
    );
  }

  // Rendu Cluster Meta
  if (title === NodeId.INTEREST_CLUSTER && Array.isArray(data)) {
    return (
      <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl overflow-hidden mb-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8">
        <div className="bg-white/[0.02] px-5 py-3 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Layers className="w-4 h-4 text-cyan-500" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-300">Cluster Meta Targeting Matrix</span>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.map((cluster, i) => (
            <div key={i} className="bg-white/[0.03] p-5 rounded-xl border border-white/5 space-y-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-cyan-500">{cluster.cluster_name}</div>
              <div className="flex flex-wrap gap-2">
                {cluster.interests.map((int: string, j: number) => (
                  <span key={j} className="px-2 py-1 bg-black rounded border border-white/10 text-[9px] text-gray-400 font-mono">
                    {int}
                  </span>
                ))}
              </div>
              <p className="text-[9px] text-gray-500 italic leading-relaxed">"{cluster.rationale}"</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Rendu Config Meta
  if (title === NodeId.AUDIENCE_ADVISOR && data.budget_recommendation) {
    return (
      <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl overflow-hidden mb-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8">
        <div className="bg-white/[0.02] px-5 py-3 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Crosshair className="w-4 h-4 text-cyan-500" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-300">Meta Technical Roadmap</span>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-4 h-4 text-cyan-500 mt-1" />
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Budget & Structure</div>
                <p className="text-xs text-gray-300 mt-1">{data.budget_recommendation}</p>
                <div className="mt-2 text-[10px] text-cyan-600 font-bold">{data.campaign_structure}</div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Objective & Optimization</div>
                <p className="text-xs text-gray-300 mt-1">{data.objective}</p>
                <p className="text-[10px] text-gray-600 mt-1">{data.optimization_goal}</p>
              </div>
            </div>
          </div>
          <div className="bg-black/40 rounded-xl p-4 border border-white/5">
            <div className="text-[9px] font-black uppercase text-gray-600 mb-3 tracking-widest">Recommended Placements</div>
            <div className="grid grid-cols-1 gap-2">
              {data.placements.map((p: string, i: number) => (
                <div key={i} className="text-[10px] font-mono text-cyan-400 flex items-center">
                  <span className="w-1.5 h-1.5 bg-cyan-900 rounded-full mr-3" /> {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rendu Grounding
  if (title === NodeId.INTEREST_LAB && data.groundingSources) {
    return (
      <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl overflow-hidden mb-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8">
        <div className="bg-white/[0.02] px-5 py-3 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Globe className="w-4 h-4 text-cyan-500" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-300">Neural Search Grounding</span>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="text-[11px] font-mono text-cyan-300/80 leading-relaxed whitespace-pre-wrap mb-6">
            {data.text}
          </div>
          {data.groundingSources.length > 0 && (
            <div className="border-t border-white/5 pt-4">
              <div className="text-[9px] font-black uppercase text-gray-500 mb-3 tracking-widest">Sources Vérifiées (Google Search)</div>
              <div className="flex flex-wrap gap-2">
                {data.groundingSources.map((chunk: any, i: number) => (
                  chunk.web && (
                    <a 
                      key={i} 
                      href={chunk.web.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full text-[9px] transition-colors"
                    >
                      <LinkIcon className="w-3 h-3 text-cyan-600" />
                      <span className="max-w-[150px] truncate text-gray-400">{chunk.web.title || "Lien Source"}</span>
                    </a>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl overflow-hidden mb-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8">
      <div className="bg-white/[0.02] px-5 py-3 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <FileJson className="w-4 h-4 text-cyan-500" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-300">{title}</span>
        </div>
        <div className="text-[9px] text-gray-600 font-mono font-bold tracking-widest">VERSION: NEURAL_DATA_7.1</div>
      </div>
      <div className="p-6 bg-black/20 overflow-x-auto">
        <pre className="text-[11px] font-mono text-cyan-300/80 leading-relaxed whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};
