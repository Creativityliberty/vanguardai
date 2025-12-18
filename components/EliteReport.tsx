import React from 'react';
import { ShieldCheck, Printer, ChevronRight, FileDown, Globe, FileType, Terminal as TerminalIcon } from 'lucide-react';
import { NodeId } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface EliteReportProps {
  artifacts: Record<string, any>;
  onBack: () => void;
}

export const EliteReport: React.FC<EliteReportProps> = ({ artifacts, onBack }) => {
  const finalMarkdown = artifacts[NodeId.CAMPAIGN_ASSEMBLER]?.content || "";
  const biz = artifacts[NodeId.BUSINESS_EXTRACTOR] || {};
  const avatar = artifacts[NodeId.AVATAR_BUILDER] || {};
  const personas = artifacts[NodeId.PERSONA_SPLITTER] || [];
  const clusters = artifacts[NodeId.INTEREST_CLUSTER] || [];
  const ads = artifacts[NodeId.COPYWRITING_MASTER] || [];
  const interview = artifacts[NodeId.INTERVIEW_SIMULATOR] || { transcript: [] };

  const parseBold = (text: string) => {
    if (!text) return "";
    // On enlève les doubles astérisques et on les remplace par des <strong> pour le rendu React
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-black text-black">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const formatMD = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      let cleanLine = line.trim();

      // Enlever tout astérisque résiduel des titres ou du texte (pour l'aspect propre demandé)
      cleanLine = cleanLine.replace(/^\*\*+|\*\*+$/g, '');

      if (cleanLine.startsWith('***') || cleanLine.startsWith('---') || cleanLine === '---' || cleanLine === '***') {
        return <hr key={i} className="my-10 border-t-2 border-gray-100 opacity-50" />;
      }

      if (cleanLine.startsWith('# ')) {
        const title = cleanLine.replace('# ', '').replace(/\*/g, '');
        return <h2 key={i} className="text-3xl font-black uppercase tracking-tighter mt-16 mb-8 border-b-4 border-black pb-2">{title}</h2>;
      }

      if (cleanLine.startsWith('## ')) {
        const title = cleanLine.replace('## ', '').replace(/\*/g, '');
        return <h3 key={i} className="text-xl font-black uppercase tracking-tight mt-12 mb-6 text-gray-900 border-l-4 border-black pl-4">{title}</h3>;
      }

      if (cleanLine.startsWith('### ')) {
        const title = cleanLine.replace('### ', '').replace(/\*/g, '');
        return <h4 key={i} className="text-lg font-bold uppercase tracking-widest mt-8 mb-4 text-cyan-800">{title}</h4>;
      }

      if (cleanLine.startsWith('* ') || cleanLine.startsWith('- ')) {
        const content = cleanLine.substring(2).replace(/\*/g, '');
        return (
          <li key={i} className="ml-8 mb-3 list-none relative text-gray-800">
            <span className="absolute -left-6 top-2 w-2 h-2 bg-black rounded-full" />
            {content}
          </li>
        );
      }

      if (cleanLine === "") return <div key={i} className="h-4" />;

      // Paragraphe normal, on parse quand même le gras si l'IA en a mis
      return <p key={i} className="mb-6 text-gray-800 leading-relaxed text-justify text-lg font-serif">{parseBold(cleanLine)}</p>;
    });
  };

  const exportAsHtml = () => {
    const reportElement = document.getElementById('elite-dossier-content');
    if (!reportElement) return;

    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>VANGUARD ELITE REPORT</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;900&family=Playfair+Display:ital,wght@0,900;1,700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background: #f0f2f5; padding: 40px; }
        .doc { background: white; max-width: 850px; margin: 0 auto; padding: 60px; border-left: 20px solid black; box-shadow: 0 40px 100px rgba(0,0,0,0.1); }
        .font-serif { font-family: 'Playfair Display', serif; }
        h1, h2, h3 { text-transform: uppercase; font-weight: 900; letter-spacing: -0.05em; }
        li { margin-left: 20px; position: relative; margin-bottom: 10px; list-style: none; }
        li::before { content: ""; position: absolute; left: -20px; top: 10px; width: 6px; height: 6px; background: black; border-radius: 50%; }
        .no-print { display: none; }
        img { max-width: 100%; border-radius: 12px; }
        @media print { body { padding: 0; background: white; } .doc { box-shadow: none; margin: 0; border-left-width: 10px; } }
    </style>
</head>
<body>
    <div class="doc">${reportElement.innerHTML}</div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VANGUARD-STRATEGIC-REPORT-${new Date().getTime()}.html`;
    a.click();
  };

  const exportAsPdf = async () => {
    const reportElement = document.getElementById('elite-dossier-content');
    if (!reportElement) return;

    addLog("Génération du PDF Intelligent en cours...");

    try {
      // 1. Capture du rendu global
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 850,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const headerHeight = 15;
      const footerHeight = 15;
      const innerPageHeight = pageHeight - headerHeight - footerHeight;

      const imgWidth = pageWidth;
      const canvasToMm = pageWidth / canvas.width;
      const imgHeight = canvas.height * canvasToMm;

      // 2. Identification des zones de coupure interdites (sections, listes, etc.)
      const avoidElements = Array.from(reportElement.querySelectorAll('section, .break-inside-avoid, h2, h3'));
      const avoidZones = avoidElements.map(el => {
        const rect = el.getBoundingClientRect();
        const containerRect = reportElement.getBoundingClientRect();
        return {
          top: (rect.top - containerRect.top) * canvasToMm,
          bottom: (rect.bottom - containerRect.top) * canvasToMm
        };
      });

      let currentTop = 0;
      let pageNum = 1;

      while (currentTop < imgHeight - 2) { // Petite marge d'erreur
        if (pageNum > 1) doc.addPage();

        let sliceHeight = innerPageHeight;
        const potentialCut = currentTop + sliceHeight;

        // Si on n'est pas à la fin, on cherche s'il y a une coupure malheureuse
        if (potentialCut < imgHeight) {
          const intersectingZone = avoidZones.find(z => z.top < potentialCut && z.bottom > potentialCut);

          if (intersectingZone && intersectingZone.top > currentTop + 20) {
            // On coupe JUSTE AVANT l'élément qui pose problème
            sliceHeight = intersectingZone.top - currentTop;
          }
        }

        // Ajout de la tranche d'image correspondante
        // Note: On utilise le décalage négatif habituel, calé sous le header
        doc.addImage(imgData, 'JPEG', 0, headerHeight - currentTop, imgWidth, imgHeight);

        // Masquage des zones hors-champ (Header & Footer zones)
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, headerHeight, 'F'); // Cache le haut qui dépasse
        doc.rect(0, headerHeight + sliceHeight, pageWidth, pageHeight - (headerHeight + sliceHeight), 'F'); // Cache le bas

        // --- HEADER RÉPÉTÉ ---
        doc.setFillColor(0, 0, 0);
        doc.rect(0, 0, pageWidth, 4, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(7);
        doc.setFont('Inter', 'bold');
        doc.text("VANGUARD STRATEGIC ELITE SYSTEM // v7.1", 10, 10);
        doc.text("CONFIDENTIAL DATA", pageWidth - 10, 10, { align: 'right' });

        // --- FOOTER RÉPÉTÉ ---
        doc.setFillColor(0, 0, 0);
        doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        const dateStr = new Date().toLocaleDateString('fr-FR');
        doc.text(`VANGUARD REALITY // ${dateStr}`, 10, pageHeight - 4);
        doc.text(`PAGE ${pageNum}`, pageWidth / 2, pageHeight - 4, { align: 'center' });
        doc.text("Neural Intelligence Output", pageWidth - 10, pageHeight - 4, { align: 'right' });

        currentTop += sliceHeight;
        pageNum++;
      }

      doc.save(`VANGUARD-ELITE-REPORT-FINAL-${new Date().getTime()}.pdf`);
      addLog("PDF Intelligent exporté avec succès.");
    } catch (error: any) {
      console.error("PDF Export failed", error);
      addLog(`ÉCHEC EXPORT PDF: ${error.message}`);
      window.print();
    }
  };

  const handlePrint = () => {
    addLog("Impression lancée...");
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-[#f8f9fa] z-[9999] flex flex-col overflow-hidden animate-in fade-in duration-500">
      <header className="bg-black text-white px-8 py-4 flex items-center justify-between shrink-0 z-[100] shadow-2xl print:hidden">
        <div className="flex items-center space-x-6">
          <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center text-[10px] font-black uppercase tracking-[0.2em] transition-all">
            <ChevronRight className="w-4 h-4 mr-2 rotate-180" /> Retour Lab
          </button>
          <div className="w-px h-5 bg-gray-800" />
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-cyan-500" />
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em]">VANGUARD <span className="text-cyan-500">DOSSIER ELITE</span></h2>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={exportAsHtml} className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center border border-white/10 transition-all">
            <Globe className="w-4 h-4 mr-2" /> EXPORT HTML
          </button>
          <button onClick={exportAsPdf} className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center shadow-lg transition-all">
            <FileType className="w-4 h-4 mr-2" /> EXPORT PDF
          </button>
          <button onClick={handlePrint} className="bg-white/5 hover:bg-white/10 text-white px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center border border-white/10 transition-all">
            <Printer className="w-4 h-4 mr-2" /> IMPRIMER
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scroll-smooth py-12 px-4 bg-[#f0f2f5] print:p-0 print:bg-white print:overflow-visible custom-scrollbar">
        <div id="elite-dossier-content" className="max-w-[850px] mx-auto bg-white shadow-[0_50px_100px_rgba(0,0,0,0.12)] relative border-l-[25px] border-black p-16 md:p-28 print:shadow-none print:p-12 print:m-0 print:border-l-[15px] print:w-full print:border-black">

          <div className="border-b-[6px] border-black pb-16 mb-24 flex justify-between items-end print:pb-8 print:mb-12">
            <div className="space-y-8">
              <div className="text-[12px] font-black uppercase tracking-[0.6em] text-gray-400">Vanguard Media // Strategic Dpt.</div>
              <h1 className="text-8xl font-black uppercase tracking-tighter leading-[0.8] m-0 font-serif print:text-6xl">Audit <br />Stratégique <br />Elite</h1>
              <div className="flex items-center space-x-6 mt-10 print:mt-4">
                <span className="bg-black text-white px-5 py-2 text-[11px] font-black uppercase tracking-[0.3em]">REF: V7.1-2025</span>
                <span className="text-[11px] font-black text-red-600 uppercase border-l-3 border-red-600 pl-6 tracking-widest">CONFIDENTIEL INTERNE</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-12 border-l-[12px] border-black mb-32 italic font-medium text-xl leading-relaxed text-gray-800 shadow-sm print:mb-12 print:p-6">
            "Ce document synthétise l'intelligence neurale de Vanguard Reality pour transformer les données psychographiques en une domination publicitaire concrète. Chaque recommandation a été validée par simulation avatar."
          </div>

          <section className="mb-32 print:mb-12 break-inside-avoid">
            <h2 className="text-4xl font-black uppercase tracking-tighter border-b-8 border-black pb-6 mb-12">01. Analyse du Noyau</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 print:gap-8">
              <div className="space-y-10">
                <div>
                  <div className="text-[11px] font-black uppercase text-gray-400 mb-3 tracking-widest">Promesse Centrale</div>
                  <p className="text-2xl font-black leading-tight text-black">"{biz.promesse}"</p>
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase text-gray-400 mb-3 tracking-widest">Mécanique Unique</div>
                  <p className="text-base text-gray-700 italic border-l-4 border-cyan-500 pl-6 leading-relaxed">{biz.mecanique_unique}</p>
                </div>
              </div>
              <div className="bg-black text-white p-10 rounded-2xl flex flex-col justify-center shadow-xl print:text-black print:bg-gray-100 print:shadow-none">
                <div className="text-[11px] font-black uppercase opacity-50 mb-6 tracking-[0.3em]">Offre de Conversion</div>
                <div className="text-2xl font-black uppercase tracking-tight leading-tight">{biz.offre}</div>
              </div>
            </div>
          </section>

          <section className="mb-32 print:mb-12 break-inside-avoid">
            <h2 className="text-4xl font-black uppercase tracking-tighter border-b-8 border-black pb-6 mb-12">02. Profil Avatar</h2>
            <div className="space-y-16">
              <div className="bg-gray-100 p-12 rounded-[2rem] border-2 border-gray-200 print:p-6">
                <div className="text-[11px] font-black uppercase text-gray-500 mb-6 tracking-[0.4em]">Identité Profilée</div>
                <p className="text-2xl font-bold italic leading-relaxed font-serif text-black">"{avatar.identity}"</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 print:gap-4 font-sans">
                <div className="p-8 border-2 border-red-100 rounded-3xl bg-red-50/40 print:p-4">
                  <div className="text-[12px] font-black uppercase text-red-600 mb-4 tracking-widest">Pain Émotionnel</div>
                  <p className="text-sm text-gray-800 leading-relaxed font-medium">{avatar.pains?.emotional}</p>
                </div>
                <div className="p-8 border-2 border-purple-100 rounded-3xl bg-purple-50/40 print:p-4">
                  <div className="text-[12px] font-black uppercase text-purple-600 mb-4 tracking-widest">Pain Spirituel</div>
                  <p className="text-sm text-gray-800 leading-relaxed font-medium">{avatar.pains?.spiritual}</p>
                </div>
                <div className="p-8 border-2 border-emerald-100 rounded-3xl bg-emerald-50/40 print:p-4">
                  <div className="text-[12px] font-black uppercase text-emerald-600 mb-4 tracking-widest">Pain Financier</div>
                  <p className="text-sm text-gray-800 leading-relaxed font-medium">{avatar.pains?.financial}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-32 print:mb-12 break-inside-avoid">
            <h2 className="text-4xl font-black uppercase tracking-tighter border-b-8 border-black pb-6 mb-12">02b. Simulation Paradigm</h2>
            <div className="space-y-6 bg-gray-900 text-cyan-400 p-10 rounded-2xl font-mono text-sm border-l-8 border-cyan-500 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10"><TerminalIcon className="w-12 h-12" /></div>
              <div className="text-[10px] uppercase tracking-widest opacity-50 mb-6">Neural Transcript / Raw Data</div>
              {(interview.transcript || []).map((item: any, i: number) => (
                <div key={i} className="space-y-3 mb-8 border-b border-cyan-500/10 pb-6 last:border-0 border-dashed">
                  <div className="flex items-start">
                    <span className="text-cyan-600 mr-4 font-black">Q:</span>
                    <span className="text-gray-300">{item.q}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-4 font-black">A:</span>
                    <span className="text-cyan-100 italic">{item.a}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-32 print:mb-12 break-inside-avoid">
            <h2 className="text-4xl font-black uppercase tracking-tighter border-b-8 border-black pb-6 mb-12">03. Matrice de Segmentation</h2>
            <div className="space-y-6">
              {personas.map((p: any, i: number) => (
                <div key={i} className="flex border-3 border-gray-100 rounded-2xl overflow-hidden group hover:border-black transition-all print:border-gray-300">
                  <div className="bg-gray-50 p-8 w-1/3 border-r-3 border-gray-100 font-black uppercase text-base flex items-center justify-center text-center print:p-4 print:text-xs">{p.nom}</div>
                  <div className="p-8 flex-1 text-base italic text-gray-700 leading-relaxed bg-white print:p-4 print:text-xs">"{p.angle_publicitaire}"</div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-32 print:mb-12 break-inside-avoid">
            <h2 className="text-4xl font-black uppercase tracking-tighter border-b-8 border-black pb-6 mb-12">04. Ciblage Meta</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 print:gap-4">
              {clusters.map((c: any, i: number) => (
                <div key={i} className="bg-gray-50 p-10 rounded-3xl border-3 border-gray-100 flex flex-col h-full print:p-4 print:border-gray-200">
                  <div className="text-[12px] font-black text-cyan-700 uppercase mb-6 tracking-[0.3em]">{c.cluster_name}</div>
                  <div className="space-y-3 mb-8 flex-1">
                    {c.interests.map((int: string, j: number) => (
                      <div key={j} className="text-[11px] font-mono font-black text-gray-600 uppercase flex items-center print:text-[9px]">
                        <span className="w-2 h-2 bg-black rounded-full mr-4 shrink-0" /> {int}
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400 italic leading-tight border-t border-gray-200 pt-4 print:text-[8px]">"{c.rationale}"</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-32 print:mb-12 break-inside-avoid">
            <h2 className="text-4xl font-black uppercase tracking-tighter border-b-8 border-black pb-6 mb-12">05. Archive Créative</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 print:gap-4">
              {ads.map((ad: any, i: number) => (
                <div key={i} className="border-3 border-gray-100 rounded-3xl overflow-hidden bg-white shadow-sm flex flex-col print:border-gray-200 print:shadow-none break-inside-avoid">
                  <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between print:p-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-black text-[10px]">V</div>
                      <div><div className="text-[10px] font-bold">Vanguard Brand</div><div className="text-[8px] text-gray-400 flex items-center">Commandité <Globe className="w-2 h-2 ml-1" /></div></div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4 flex-1 print:p-4">
                    <div className="text-lg font-black leading-tight uppercase tracking-tighter">"{ad.hook}"</div>
                    <p className="text-[10px] text-gray-700 leading-relaxed text-justify">{ad.body}</p>
                  </div>
                  {ad.image_url && (
                    <div className="aspect-[4/5] w-full">
                      <img src={ad.image_url} alt="Ad Visual" className="w-full h-full object-cover" crossOrigin="anonymous" />
                    </div>
                  )}
                  <div className="p-4 bg-gray-50 flex justify-between items-center border-t border-gray-100 print:p-2">
                    <span className="text-[10px] font-black uppercase tracking-widest">{ad.cta}</span>
                    <span className="text-[8px] text-gray-400 font-mono text-[6px]">SEGMENT: {ad.persona}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-32 page-break-before print:mb-12">
            <h2 className="text-4xl font-black uppercase tracking-tighter border-b-8 border-black pb-6 mb-12">06. Synthèse & Roadmap</h2>
            <div className="prose-elite">
              {formatMD(finalMarkdown)}
            </div>
          </section>

          <div className="mt-48 pt-24 border-t-[8px] border-black flex flex-col items-center space-y-6 text-center print:mt-12 print:pt-12">
            <div className="text-3xl font-black uppercase tracking-[0.6em] text-black print:text-xl">VANGUARD MEDIA</div>
            <p className="text-[12px] font-black text-gray-400 uppercase tracking-[0.5em] print:text-[8px]">INTELLIGENCE PUBLICITAIRE // RÉSULTATS D'ÉLITE <br /> PROTOCOLE V7.1 FINALISÉ</p>
          </div>
        </div>
        <div className="h-48 no-print" />
      </div>

      <style>{`
        @media print {
          body { background: white !important; overflow: visible !important; height: auto !important; }
          .no-print { display: none !important; }
          .custom-scrollbar { overflow: visible !important; height: auto !important; }
          #elite-dossier-content { 
            box-shadow: none !important; 
            margin: 0 auto !important; 
            width: 100% !important; 
            border-left-width: 15px !important;
            padding: 20mm !important;
          }
          .page-break-before { page-break-before: always; }
          .break-inside-avoid { break-inside: avoid; }
          @page { margin: 10mm; size: a4; }
        }
        .prose-elite li { position: relative; margin-bottom: 12px; }
        .prose-elite strong { color: black; font-weight: 900; }
        .custom-scrollbar::-webkit-scrollbar { width: 0; background: transparent; }
      `}</style>
    </div>
  );
};

// Injection d'une fonction addLog simple si non passée
const addLog = (msg: string) => console.log(`[EliteReport] ${msg}`);
