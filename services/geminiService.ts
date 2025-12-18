
import { GoogleGenAI, Type } from "@google/genai";
import { ImageSize } from "../types";

const MODEL_FAST = 'gemini-3-flash-preview';
const MODEL_PRO = 'gemini-3-pro-preview';
const MODEL_PRO_IMAGE = 'gemini-3-pro-image-preview';
const MODEL_FLASH_IMAGE = 'gemini-2.5-flash-image';

export class GeminiService {
  private get client() {
    if (!process.env.API_KEY) {
      throw new Error("Missing API_KEY environment variable");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeBusiness(brief: string) {
    const response = await this.client.models.generateContent({
      model: MODEL_FAST,
      contents: `Analyse ce brief business et extrais les métriques marketing clés. 
      Brief: "${brief}"
      Réponds en JSON avec: promesse, mecanique_unique, offre.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            promesse: { type: Type.STRING },
            mecanique_unique: { type: Type.STRING },
            offre: { type: Type.STRING },
          },
          required: ["promesse", "mecanique_unique", "offre"],
        }
      }
    });
    return JSON.parse(response.text || "{}");
  }

  async buildAvatar(biz: any) {
    const response = await this.client.models.generateContent({
      model: MODEL_PRO,
      contents: `Construis un profil d'avatar psychologique profond pour cette offre : ${JSON.stringify(biz)}.
      Inclus l'identité, la routine, les douleurs (émotionnelles, spirituelles, financières) et le "hook" marketing central.`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            identity: { type: Type.STRING },
            routine: { type: Type.STRING },
            pains: {
              type: Type.OBJECT,
              properties: {
                emotional: { type: Type.STRING },
                spiritual: { type: Type.STRING },
                financial: { type: Type.STRING }
              },
              required: ["emotional", "spiritual", "financial"]
            },
            hook: { type: Type.STRING }
          },
          required: ["identity", "routine", "pains", "hook"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  }

  async simulateAvatarResponse(question: string, avatarData: any) {
    const response = await this.client.models.generateContent({
      model: MODEL_FAST,
      contents: `Tu ES l'avatar défini ici : ${JSON.stringify(avatarData)}. 
      Réponds à la question suivante avec authenticité et vulnérabilité.
      Question: ${question}`,
      config: {
        systemInstruction: "Réponds à la première personne ('Je'). Pas de langage marketing. Sois un humain réel.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            confidence: { type: Type.NUMBER }
          },
          required: ["answer", "confidence"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  }

  async splitPersonas(avatar: any) {
    const response = await this.client.models.generateContent({
      model: MODEL_FAST,
      contents: `Divise cet avatar global en 4 segments (personas) hyper-spécifiques avec chacun un angle publicitaire différent.
      Avatar: ${JSON.stringify(avatar)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              nom: { type: Type.STRING },
              id: { type: Type.INTEGER },
              angle_publicitaire: { type: Type.STRING }
            },
            required: ["nom", "id", "angle_publicitaire"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  }

  async detectAwareness(brief: string) {
    const response = await this.client.models.generateContent({
      model: MODEL_FAST,
      contents: `Détermine le niveau de conscience d'Eugene Schwartz (1-5) pour : "${brief}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            niveau: { type: Type.INTEGER },
            raison: { type: Type.STRING }
          },
          required: ["niveau", "raison"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  }

  async generateStrategy(awareness: any, biz: any) {
    const response = await this.client.models.generateContent({
      model: MODEL_PRO,
      contents: `Génère une stratégie d'angle d'attaque marketing basée sur le niveau de conscience ${awareness.niveau}.
      Offre: ${JSON.stringify(biz)}`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            angle: { type: Type.STRING },
            hook: { type: Type.STRING }
          },
          required: ["angle", "hook"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  }

  async researchInterests(query: string) {
    const response = await this.client.models.generateContent({
      model: MODEL_PRO,
      contents: `Identifie 15 intérêts Meta Ads hyper-spécifiques et réels pour : ${query}. Utilise Google Search pour trouver des intérêts actuels et valides.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    return {
      text: response.text,
      groundingSources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  }

  async clusterInterests(interestsText: string) {
    const response = await this.client.models.generateContent({
      model: MODEL_PRO,
      contents: `Organise ces intérêts Meta Ads en 3 clusters thématiques logiques (ex: 'Symptômes', 'Outils spirituels', 'Célébrités/Pages').
      Données: ${interestsText}`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              cluster_name: { type: Type.STRING },
              interests: { type: Type.ARRAY, items: { type: Type.STRING } },
              rationale: { type: Type.STRING }
            },
            required: ["cluster_name", "interests", "rationale"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  }

  async generateMetaConfig(biz: any, strategy: any) {
    const response = await this.client.models.generateContent({
      model: MODEL_PRO,
      contents: `Génère la configuration technique recommandée pour Meta Ads.
      Offre: ${JSON.stringify(biz)}
      Stratégie: ${JSON.stringify(strategy)}`,
      config: {
        thinkingConfig: { thinkingBudget: 16000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            budget_recommendation: { type: Type.STRING },
            campaign_structure: { type: Type.STRING },
            objective: { type: Type.STRING },
            placements: { type: Type.ARRAY, items: { type: Type.STRING } },
            optimization_goal: { type: Type.STRING }
          },
          required: ["budget_recommendation", "campaign_structure", "objective", "placements", "optimization_goal"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  }

  async generateCopy(persona: any, angle: string) {
    const response = await this.client.models.generateContent({
      model: MODEL_PRO,
      contents: `Rédige une publicité Facebook haute-conversion pour le persona : ${persona.nom}. 
      Angle : ${angle}. Inclus un prompt visuel détaillé pour Imagen.`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            persona: { type: Type.STRING },
            angle: { type: Type.STRING },
            hook: { type: Type.STRING },
            body: { type: Type.STRING },
            cta: { type: Type.STRING },
            image_prompt: { type: Type.STRING }
          },
          required: ["persona", "angle", "hook", "body", "cta", "image_prompt"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  }

  async generateFinalDossier(allArtifacts: any) {
    const response = await this.client.models.generateContent({
      model: MODEL_PRO,
      contents: `Rédige le dossier stratégique final de niveau 'Vanguard Strategic Counsel' pour le client. 
      Utilise tous les artefacts suivants : ${JSON.stringify(allArtifacts)}.
      
      STRUCTURE ET CONTENU CRITIQUE :
      1. Section 06 Synthèse : Ne mets PAS d'astérisques (**) dans les titres ou le corps du texte, utilise des structures de phrases propres.
      2. Stratégie Meta Ads Avancée :
         - Détaille des audiences spécifiques pour les clusters (Divinatoires, Énergétique, Psychologique).
         - Suggère des audiences personnalisées (Retargeting sur 3-secondes-video-views, 75%-video-views, et Page-Visitors 30-days).
         - Suggère une stratégie de Lookalikes (LAL) 1% basée sur les clients existants ou les conversions.
      3. Ton : Froid, analytique, expert, mais percutant.
      4. Roadmap : 30 jours (Semaine 1: Setup Pixel & Creative, Semaine 2: Test broad vs Intérêts, Semaine 3: Scale winners, Semaine 4: Retargeting LAL).`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text;
  }

  async generateImage(prompt: string, size: ImageSize = '1K'): Promise<string | null> {
    try {
      const response = await this.client.models.generateContent({
        model: MODEL_PRO_IMAGE,
        contents: {
          parts: [{ text: `High-end professional advertising visual, 8k resolution, cinematic lighting: ${prompt}` }]
        },
        config: {
          imageConfig: { 
            aspectRatio: "3:4",
            imageSize: size
          }
        }
      });
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (e) {
      console.error("Image generation failed", e);
      return null;
    }
  }

  async editImage(base64Image: string, prompt: string): Promise<string | null> {
    try {
      const mimeType = 'image/png';
      const data = base64Image.split(',')[1] || base64Image;

      const response = await this.client.models.generateContent({
        model: MODEL_FLASH_IMAGE,
        contents: {
          parts: [
            {
              inlineData: {
                data: data,
                mimeType: mimeType,
              },
            },
            {
              text: `Apply the following edit to this image: ${prompt}. Maintain the core product and layout but modify the visual style or specific elements requested.`,
            },
          ],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (e) {
      console.error("Image editing failed", e);
      return null;
    }
  }
}
