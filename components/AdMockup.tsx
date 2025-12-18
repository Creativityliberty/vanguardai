
import React, { useState } from 'react';
import { Sparkles, Globe, MoreHorizontal, Loader2, RefreshCw, Wand2 } from 'lucide-react';
import { AdData, ImageSize } from '../types';
import { GeminiService } from '../services/geminiService';

interface AdMockupProps {
  ad: AdData;
  index: number;
  service: GeminiService;
  onImageGenerated?: (index: number, url: string) => void;
}

export const AdMockup: React.FC<AdMockupProps> = ({ ad, index, service, onImageGenerated }) => {
  const [image, setImage] = useState<string | null>(ad.image_url || null);
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [editPrompt, setEditPrompt] = useState('');
  const [showEdit, setShowEdit] = useState(false);

  const generateVisual = async () => {
    if (loading) return;
    setLoading(true);
    const imgData = await service.generateImage(ad.image_prompt, imageSize);
    if (imgData) {
      setImage(imgData);
      if (onImageGenerated) onImageGenerated(index, imgData);
    }
    setLoading(false);
  };

  const applyEdit = async () => {
    if (!image || !editPrompt || editLoading) return;
    setEditLoading(true);
    const editedData = await service.editImage(image, editPrompt);
    if (editedData) {
      setImage(editedData);
      if (onImageGenerated) onImageGenerated(index, editedData);
      setEditPrompt('');
    }
    setEditLoading(false);
  };

  return (
    <div className="bg-white text-black rounded-xl overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col h-full">
      {/* Header Facebook Style */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-black text-sm">V</div>
          <div>
            <div className="text-sm font-bold leading-none">Vanguard Brand</div>
            <div className="text-[11px] text-gray-500 flex items-center mt-1">
              Sponsored <Globe className="w-3 h-3 ml-1"/>
            </div>
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-400" />
      </div>

      {/* Body Text */}
      <div className="px-4 py-3 text-sm text-gray-900 leading-relaxed space-y-2 whitespace-pre-wrap shrink-0">
        <p className="font-bold">{ad.hook}</p>
        <p className="line-clamp-3 hover:line-clamp-none transition-all">{ad.body}</p>
      </div>

      {/* Image / Generation Area */}
      <div className="bg-gray-100 aspect-[4/5] relative group flex items-center justify-center overflow-hidden flex-1">
        {image ? (
          <div className="w-full h-full relative">
            <img src={image} alt="AI Generated" className="w-full h-full object-cover animate-in fade-in duration-1000" />
            
            {/* Edit Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-col space-y-2 no-print">
              {showEdit ? (
                <div className="bg-black/80 backdrop-blur-md p-2 rounded-xl border border-white/10 flex items-center shadow-2xl animate-in slide-in-from-bottom-2">
                  <input 
                    type="text"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="Describe change (e.g. 'Add neon filter')..."
                    className="bg-transparent text-[10px] text-white outline-none flex-1 px-2 font-mono"
                    onKeyDown={(e) => e.key === 'Enter' && applyEdit()}
                  />
                  <button 
                    onClick={applyEdit}
                    disabled={editLoading}
                    className="p-1.5 bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-colors disabled:opacity-50"
                  >
                    {editLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3 text-white" />}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowEdit(true)}
                  className="self-start bg-black/50 hover:bg-black/70 backdrop-blur-md text-[10px] text-white px-3 py-1.5 rounded-full border border-white/10 flex items-center space-x-2 transition-all"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>EDIT IMAGE</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center p-8 flex flex-col items-center no-print">
            <div className="text-gray-400 uppercase tracking-widest text-[10px] font-black mb-4">Neural Canvas v3.0</div>
            
            <div className="flex bg-gray-200 p-1 rounded-lg mb-6 border border-gray-300">
              {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setImageSize(size)}
                  className={`px-3 py-1 text-[9px] font-black rounded ${imageSize === size ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:text-black'}`}
                >
                  {size}
                </button>
              ))}
            </div>

            <p className="text-[10px] text-gray-500 font-mono italic mb-6 max-w-[250px] line-clamp-4">
              {ad.image_prompt}
            </p>
            
            <button 
              onClick={generateVisual} 
              disabled={loading}
              className="inline-flex items-center px-6 py-2.5 bg-black text-white rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2 text-cyan-400" />}
              {loading ? "INITIALIZING..." : `GENERATE ${imageSize} VISUAL`}
            </button>
          </div>
        )}
      </div>

      {/* Footer Footer */}
      <div className="bg-gray-50 p-4 flex items-center justify-between border-t border-gray-100 shrink-0">
        <div>
          <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Limited Campaign</div>
          <div className="text-xs font-bold text-gray-900 mt-0.5">vanguard.ai</div>
        </div>
        <button className="bg-gray-200 px-5 py-2 rounded text-[11px] font-black text-gray-800 uppercase tracking-widest hover:bg-gray-300 transition-colors">
          {ad.cta || "Learn More"}
        </button>
      </div>
    </div>
  );
};
