
import { GoogleGenAI, Type } from "@google/genai";
import { ImageSize } from "../types";

const MODEL_FAST = 'gemini-2.5-flash';
const MODEL_PRO = 'gemini-2.5-pro';
const MODEL_PRO_IMAGE = 'gemini-2.5-flash-image';
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
      Réponds EXCLUSIVEMENT en Français.
      Structure de réponse JSON attendue avec les champs: promesse (la promesse forte), mecanique_unique (comment ça marche de façon unique), offre (le package vendu).`,
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
      contents: `Construis un profil d'avatar psychologique profond et détaillé pour cette offre : ${JSON.stringify(biz)}.
      Réponds EXCLUSIVEMENT en Français.
      Inclus l'identité (qui est cette personne), sa routine quotidienne, ses douleurs profondes (émotionnelles, spirituelles, financières) et le "hook" marketing central qui stopperait son scroll.`,
      config: {
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
      Réponds à la question suivante avec authenticité, vulnérabilité et SANS langage marketing.
      Tu dois répondre EXCLUSIVEMENT en Français, comme un humain réel.
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
      contents: `Rédige une publicité Facebook haute-conversion pour le persona : ${persona.nom}. 
      Angle psychologique : ${angle}. 
      Réponds EXCLUSIVEMENT en Français.
      La publicité doit inclure un crochet (hook) irrésistible, un corps de texte émotionnel et un appel à l'action clair.
      Inclus également un prompt visuel détaillé traduisible pour Imagen afin de générer le visuel parfait.`,
      config: {
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
      Réponds EXCLUSIVEMENT en Français.
      Utilise l'intégralité des artefacts suivants pour une synthèse parfaite : ${JSON.stringify(allArtifacts)}.
      
      STRUCTURE ET CONTENU CRITIQUE :
      1. Section 06 Synthèse : Ne mets PAS d'astérisques (**) dans les titres ou le corps du texte, utilise des structures de phrases propres.
      2. Stratégie Meta Ads Avancée :
         - Détaille des audiences spécifiques pour les clusters (Divinatoires, Énergétique, Psychologique).
         - Suggère des audiences personnalisées (Retargeting sur 3-secondes-video-views, 75%-video-views, et Page-Visitors 30-days).
         - Suggère une stratégie de Lookalikes (LAL) 1% basée sur les clients existants ou les conversions.
      3. Ton : Froid, analytique, expert, mais percutant.
      4. Roadmap : 30 jours (Semaine 1: Setup Pixel & Creative, Semaine 2: Test broad vs Intérêts, Semaine 3: Scale winners, Semaine 4: Retargeting LAL).`,
      config: {}
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
