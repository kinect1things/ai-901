import type { Domain, ExamCode, ExamMeta } from '../lib/types'
import { REF } from './references'

// ---------------------------------------------------------------------------
// Exam metadata + official domain blueprints.
//
// AI-901 is the CURRENT exam (replaces AI-900 on 2026-06-30). AI-900 is kept
// as foundational study material. Weightings + domain names are quoted from
// the official Microsoft Learn study guides (AI-901 as of 2026-04-15,
// AI-900 as of 2025-05-02).
// ---------------------------------------------------------------------------

export const EXAMS: Record<ExamCode, ExamMeta> = {
  'AI-901': {
    code: 'AI-901',
    title: 'Azure AI Fundamentals',
    status: 'current',
    passingScore: 700,
    tagline: 'The current exam — generative AI, agents & Microsoft Foundry.',
    note: 'Replaces AI-900 (which retires 30 Jun 2026). Same certification: Microsoft Certified: Azure AI Fundamentals.',
    studyGuideUrl: REF.studyGuide901.url,
  },
  'AI-900': {
    code: 'AI-900',
    title: 'Azure AI Fundamentals (legacy)',
    status: 'legacy',
    passingScore: 700,
    tagline: 'Foundational concepts — ML, vision, NLP & generative AI.',
    note: 'Retires 30 Jun 2026. Excellent foundational study material that complements AI-901.',
    studyGuideUrl: REF.studyGuide900.url,
  },
}

export const DOMAINS: Domain[] = [
  // ----------------------------- AI-901 --------------------------------
  {
    id: 'ai901-d1',
    exam: 'AI-901',
    name: 'Identify AI concepts and capabilities',
    weight: '40–45%',
    weightValue: 0.425,
    blurb:
      'Responsible AI principles, how generative AI models work, choosing models, deployment options, and recognizing AI workloads (generative, agentic, text, speech, vision, information extraction).',
  },
  {
    id: 'ai901-d2',
    exam: 'AI-901',
    name: 'Implement AI solutions by using Microsoft Foundry',
    weight: '55–60%',
    weightValue: 0.575,
    blurb:
      'Hands-on Foundry: deploy models, write system/user prompts, build chat clients & agents with the Foundry SDK, add text/speech/vision capabilities, and extract information with Content Understanding.',
  },

  // ----------------------------- AI-900 --------------------------------
  {
    id: 'ai900-d1',
    exam: 'AI-900',
    name: 'AI workloads and considerations',
    weight: '15–20%',
    weightValue: 0.175,
    blurb:
      'Identify common AI workloads (vision, NLP, document processing, generative AI) and the six Microsoft responsible AI principles.',
  },
  {
    id: 'ai900-d2',
    exam: 'AI-900',
    name: 'Fundamental principles of machine learning on Azure',
    weight: '15–20%',
    weightValue: 0.175,
    blurb:
      'Regression, classification, clustering, deep learning & Transformers; features vs. labels; training/validation; Azure Machine Learning and AutoML.',
  },
  {
    id: 'ai900-d3',
    exam: 'AI-900',
    name: 'Computer vision workloads on Azure',
    weight: '15–20%',
    weightValue: 0.175,
    blurb:
      'Image classification, object detection, OCR, and facial analysis with Azure AI Vision and Azure AI Face.',
  },
  {
    id: 'ai900-d4',
    exam: 'AI-900',
    name: 'Natural Language Processing workloads on Azure',
    weight: '15–20%',
    weightValue: 0.175,
    blurb:
      'Key phrase extraction, entity recognition, sentiment analysis, language modeling, speech, and translation with Azure AI Language, Speech and Translator.',
  },
  {
    id: 'ai900-d5',
    exam: 'AI-900',
    name: 'Generative AI workloads on Azure',
    weight: '20–25%',
    weightValue: 0.225,
    blurb:
      'Generative AI models & scenarios, responsible generative AI, Azure OpenAI Service, and the Azure AI Foundry model catalog.',
  },
]

export const DOMAINS_BY_ID: Record<string, Domain> = Object.fromEntries(
  DOMAINS.map((d) => [d.id, d]),
)

export function domainsForExam(exam: ExamCode): Domain[] {
  return DOMAINS.filter((d) => d.exam === exam)
}

export const EXAM_ORDER: ExamCode[] = ['AI-901', 'AI-900']
