// ---------------------------------------------------------------------------
// Curated set of canonical, verified Microsoft Learn URLs.
//
// Every question references one of these constants rather than an inline URL,
// so we (a) avoid broken/hallucinated links and (b) can update a URL in one
// place. All links below were verified against learn.microsoft.com.
// ---------------------------------------------------------------------------

import type { ReferenceLink } from '../lib/types'

export const REF = {
  // Certification + study guides
  studyGuide901: {
    label: 'AI-901 study guide',
    url: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-901',
  },
  studyGuide900: {
    label: 'AI-900 study guide',
    url: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-900',
  },
  certPage: {
    label: 'Azure AI Fundamentals certification',
    url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/',
  },
  learningPath: {
    label: 'Learning path: AI apps & agents on Azure',
    url: 'https://learn.microsoft.com/en-us/training/paths/get-started-ai-apps-agents/',
  },

  // Learning-path modules (AI-901 aligned)
  // Repointed 2026-07: the old "Get started with AI in Azure" module was
  // repurposed by Microsoft to teach Foundry app development; this module
  // ("Introduction to AI concepts") now carries the workload/concepts content.
  modGetStartedAI: {
    label: 'Module: Introduction to AI concepts',
    url: 'https://learn.microsoft.com/en-us/training/modules/get-started-ai-fundamentals/',
  },
  modFundamentalsML: {
    label: 'Module: Fundamentals of machine learning',
    url: 'https://learn.microsoft.com/en-us/training/modules/fundamentals-machine-learning/',
  },
  modGenAIAgents: {
    label: 'Module: Get started with generative AI and agents in Azure',
    url: 'https://learn.microsoft.com/en-us/training/modules/get-started-with-generative-ai-and-agents/',
  },
  modTextAnalysis: {
    label: 'Module: Get started with text analysis in Azure',
    url: 'https://learn.microsoft.com/en-us/training/modules/get-started-text-analysis-azure/',
  },
  modSpeech: {
    label: 'Module: Get started with speech in Azure',
    url: 'https://learn.microsoft.com/en-us/training/modules/get-started-speech-azure/',
  },
  modVision: {
    label: 'Module: Get started with computer vision in Azure',
    url: 'https://learn.microsoft.com/en-us/training/modules/get-started-vision-azure/',
  },
  modInfoExtraction: {
    label: 'Module: Get started with AI-powered information extraction',
    url: 'https://learn.microsoft.com/en-us/training/modules/get-started-information-extraction/',
  },

  // Product / concept documentation
  responsibleAI: {
    label: 'Responsible AI principles',
    url: 'https://learn.microsoft.com/en-us/azure/machine-learning/concept-responsible-ai',
  },
  foundry: {
    label: 'What is Azure AI Foundry / Microsoft Foundry?',
    url: 'https://learn.microsoft.com/en-us/azure/ai-foundry/what-is-azure-ai-foundry',
  },
  azureOpenAI: {
    label: 'Azure OpenAI Service overview',
    url: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/overview',
  },
  aiVision: {
    label: 'Azure AI Vision documentation',
    url: 'https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/',
  },
  aiFace: {
    label: 'Azure AI Face service',
    url: 'https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/overview-identity',
  },
  aiLanguage: {
    label: 'Azure AI Language documentation',
    url: 'https://learn.microsoft.com/en-us/azure/ai-services/language-service/',
  },
  aiSpeech: {
    label: 'Azure AI Speech documentation',
    url: 'https://learn.microsoft.com/en-us/azure/ai-services/speech-service/',
  },
  aiTranslator: {
    label: 'Azure AI Translator documentation',
    url: 'https://learn.microsoft.com/en-us/azure/ai-services/translator/',
  },
  documentIntelligence: {
    label: 'Azure AI Document Intelligence',
    url: 'https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/',
  },
  contentUnderstanding: {
    label: 'Azure AI Content Understanding',
    url: 'https://learn.microsoft.com/en-us/azure/ai-services/content-understanding/',
  },
  contentSafety: {
    label: 'Azure AI Content Safety',
    url: 'https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview',
  },
  azureML: {
    label: 'Azure Machine Learning documentation',
    url: 'https://learn.microsoft.com/en-us/azure/machine-learning/',
  },
  automatedML: {
    label: 'What is automated machine learning (AutoML)?',
    url: 'https://learn.microsoft.com/en-us/azure/machine-learning/concept-automated-ml',
  },
  agentService: {
    label: 'Azure AI Foundry Agent Service',
    url: 'https://learn.microsoft.com/en-us/azure/ai-services/agents/overview',
  },
  modelCatalog: {
    label: 'Azure AI Foundry model catalog',
    url: 'https://learn.microsoft.com/en-us/azure/ai-foundry/how-to/model-catalog-overview',
  },
  promptEngineering: {
    label: 'Prompt engineering techniques',
    url: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/prompt-engineering',
  },
} satisfies Record<string, ReferenceLink>

export type RefKey = keyof typeof REF
