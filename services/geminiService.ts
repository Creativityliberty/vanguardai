
import { GoogleGenAI, Type } from "@google/genai";
import { ImageSize } from "../types";

const MODEL_FAST = 'gemini-3-flash-preview';
const MODEL_PRO = 'gemini-3-pro-preview';
const MODEL_PRO_IMAGE = 'gemini-3-pro-image-preview';
const MODEL_FLASH_IMAGE = 'gemini-3-pro-image-preview';

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
      contents: `${brief}\n\nAnalyse ce brief business et extrais les métriques marketing clés. 
      Structure de réponse JSON attendue avec les champs: promesse, mecanique_unique, offre.`,
      config: {
        systemInstruction: "Tu es l'Extracteur Business de VanguardAI. Tu analyses les briefs et extrais les métriques clés. Réponds EXCLUSIVEMENT en Français.",
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
      contents: `${JSON.stringify(biz)}\n\nConstruis un profil d'avatar psychologique profond et détaillé pour cette offre.
      Inclus l'identité, sa routine quotidienne, ses douleurs profondes et le "hook" marketing central.`,
      config: {
        systemInstruction: "Tu es le Vanguard Avatar Architect. Ton rôle est de créer des profils psychologiques ultra-détaillés. Réponds EXCLUSIVEMENT en Français.",
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
      contents: `CONTEXTE (AVATAR): ${JSON.stringify(avatarData)}\n\nQUESTION: ${question}`,
      config: {
        systemInstruction: "Tu ES l'avatar défini. Réponds avec authenticité, vulnérabilité et SANS langage marketing. Réponds à la première personne ('Je'). Pas de marketing. Sois un humain réel. Réponds EXCLUSIVEMENT en Français.",
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
      contents: `Divise cet avatar global en 4 segments de clientèle (personas) hyper-spécifiques.
      Pour chaque persona, définis un angle publicitaire psychologique différent et percutant.
      Réponds EXCLUSIVEMENT en Français.
      Avatar source: ${JSON.stringify(avatar)}`,
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
      contents: `Détermine précisément le niveau de conscience d'Eugene Schwartz (de 1 - Inconscient à 5 - Très Conscient) pour ce produit/service : "${brief}".
      Réponds EXCLUSIVEMENT en Français.`,
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
      contents: `Génère une stratégie d'attaque marketing de haut niveau basée sur le niveau de conscience ${awareness.niveau}.
      L'objectif est de briser les barrières psychologiques.
      Réponds EXCLUSIVEMENT en Français.
      Offre: ${JSON.stringify(biz)}`,
      config: {
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
      contents: `Identifie 15 intérêts Meta Ads (Facebook/Instagram) hyper-spécifiques, réels et ciblables pour : ${query}. 
      Utilise Google Search pour trouver des intérêts actuels et valides utilisés par les régies publicitaires.
      Réponds EXCLUSIVEMENT en Français.`,
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
      contents: `Organise ces intérêts Meta Ads en 3 clusters thématiques stratégiques (ex: 'Symptômes & Problèmes', 'Outils & Logiciels', 'Influenceurs & Autorités').
      Réponds EXCLUSIVEMENT en Français.
      Données à traiter: ${interestsText}`,
      config: {
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
      contents: `Génère la configuration technique experte recommandée pour lancer les campagnes Meta Ads.
      Réponds EXCLUSIVEMENT en Français.
      Offre: ${JSON.stringify(biz)}
      Stratégie adoptée: ${JSON.stringify(strategy)}`,
      config: {
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
      contents: `${JSON.stringify(persona)}\n\nRédige une publicité Facebook haute-conversion pour ce persona. 
      Angle psychologique : ${angle}. 
      La publicité doit inclure un crochet (hook) irrésistible, un corps de texte émotionnel et un appel à l'action clair.
      Inclus également un prompt visuel détaillé traduisible pour Imagen afin de générer le visuel parfait.`,
      config: {
        systemInstruction: "Tu es le Vanguard Copywriting Master. Tu rédiges des publicités à travers le prisme de la psychologie humaine. Réponds EXCLUSIVEMENT en Français.",
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
      contents: `ARTEFACTS PRÉCÉDENTS : ${JSON.stringify(allArtifacts)}\n\nRédige le dossier stratégique final de niveau 'Vanguard Strategic Counsel' pour le client. 
      
      STRUCTURE ET CONTENU CRITIQUE :
      1. Section 06 Synthèse : Ne mets PAS d'astérisques (**) dans les titres ou le corps du texte...`,
      config: {
        systemInstruction: "Tu es le Vanguard Strategic Counsel. Ton rôle est de compiler tous les artefacts en un dossier d'élite. Ton ton est froid, analytique et expert. Réponds EXCLUSIVEMENT en Français.",
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
          // Simplification pour éviter 400 INVALID_ARGUMENT
          // On peut aussi essayer sans imageConfig si le modèle est multimodal direct
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
