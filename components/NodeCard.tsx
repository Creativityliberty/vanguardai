
import React from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { NodeConfig } from '../types';

interface NodeCardProps {
  node: NodeConfig;
  status: string;
  isActive: boolean;
}

export const NodeCard: React.FC<NodeCardProps> = ({ node, status, isActive }) => {
  const isDone = status === 'done';
  
  return (
    <div className={`flex items-center p-3 rounded-xl transition-all duration-300 border ${
      isActive 
        ? 'bg-cyan-900/10 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] scale-[1.02]' 
        : 'border-transparent hover:bg-white/5'
    }`}>
      <div className={`mr-4 p-2 rounded-lg ${
        isActive ? 'bg-cyan-500/20 text-cyan-400' : isDone ? 'text-green-500' : 'text-gray-600'
      }`}>
        {isDone ? <CheckCircle2 className="w-5 h-5"/> : isActive ? <Loader2 className="w-5 h-5 animate-spin"/> : node.icon}
      </div>
      <div className="flex-1">
        <div className={`text-[10px] font-black uppercase tracking-[0.15em] ${
          isActive ? 'text-cyan-100' : isDone ? 'text-gray-300' : 'text-gray-500'
        }`}>
          {node.label}
        </div>
        {isActive && (
          <div className="text-[9px] text-cyan-500 font-mono mt-0.5 animate-pulse">
            EXE: {node.tech}
          </div>
        )}
      </div>
    </div>
  );
};
