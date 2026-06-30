import type { RawQuestion } from '../raw-types'

// Build-list (ordering) and matching questions, modeled on Microsoft's
// "arrange in the correct order" and "match to the description" formats.
// For build-list, items are authored IN THE CORRECT ORDER (the loader shuffles
// them for display). Everything stays at fundamentals level.
export const questions: RawQuestion[] = [
  // ----------------------------- build-list -------------------------------
  {
    id: 'ai901-d2-201',
    exam: 'AI-901',
    domainId: 'ai901-d2',
    difficulty: 'medium',
    type: 'build-list',
    prompt:
      'You want to use a generative AI model in Microsoft Foundry and then call it from your own application. Arrange the high-level steps in the correct order.',
    items: [
      { text: 'Browse the model catalog and select a model' },
      { text: 'Deploy the model to create an endpoint' },
      { text: 'Test the deployed model with prompts in the playground' },
      { text: 'Build a client app with the Foundry SDK that calls the endpoint' },
    ],
    explanation:
      'You first discover a model in the catalog, deploy it to get an endpoint, experiment in the playground, then use the Foundry SDK to call that endpoint from your own app.',
    refKey: 'modGenAIAgents',
    tags: ['foundry', 'deployment'],
  },
  {
    id: 'ai901-d2-202',
    exam: 'AI-901',
    domainId: 'ai901-d2',
    difficulty: 'hard',
    type: 'build-list',
    prompt:
      'You are creating a single-agent solution in Microsoft Foundry. Arrange the steps in the correct order.',
    items: [
      { text: 'Deploy a model from the catalog for the agent to use' },
      { text: 'Create an agent and give it instructions describing its goal' },
      { text: 'Test the agent in the Foundry portal' },
      { text: 'Build a lightweight client application that calls the agent' },
    ],
    explanation:
      'An agent needs a deployed model and instructions before it can run. You test it in the portal, then build a client app to interact with it.',
    refKey: 'agentService',
    tags: ['agents', 'agent-service'],
  },
  {
    id: 'ai900-d2-201',
    exam: 'AI-900',
    domainId: 'ai900-d2',
    difficulty: 'medium',
    type: 'build-list',
    prompt:
      'A data scientist trains a supervised machine learning model with Azure Machine Learning. Arrange the typical workflow steps in the correct order.',
    items: [
      { text: 'Collect and prepare a labeled dataset' },
      { text: 'Split the data into training and validation sets' },
      { text: 'Train the model on the training data' },
      { text: 'Evaluate the model against the validation data' },
      { text: 'Deploy the model to an endpoint for predictions' },
    ],
    explanation:
      'Supervised learning prepares labeled data, holds back a validation set, trains on the training set, evaluates on unseen validation data, then deploys the model.',
    refKey: 'azureML',
    tags: ['ml', 'workflow'],
  },
  {
    id: 'ai900-d5-201',
    exam: 'AI-900',
    domainId: 'ai900-d5',
    difficulty: 'medium',
    type: 'build-list',
    prompt:
      'A chatbot uses Retrieval Augmented Generation (RAG) to answer questions from a company knowledge base. Arrange what happens for a single question in the correct order.',
    items: [
      { text: "Receive the user's question" },
      { text: 'Retrieve relevant passages from the knowledge source' },
      { text: 'Add the retrieved passages to the prompt as context' },
      { text: 'The model generates an answer grounded in that context' },
    ],
    explanation:
      'RAG retrieves relevant source content for the question and injects it into the prompt so the model can generate a grounded, accurate answer instead of relying on memory alone.',
    refKey: 'modGenAIAgents',
    tags: ['gen-ai', 'rag'],
  },
  {
    id: 'ai901-d1-201',
    exam: 'AI-901',
    domainId: 'ai901-d1',
    difficulty: 'easy',
    type: 'build-list',
    prompt:
      'Order the basic stages of how a generative chat model handles a request, from input to output.',
    items: [
      { text: 'The user provides a prompt' },
      { text: 'The prompt is broken into tokens' },
      { text: 'The model predicts the response tokens' },
      { text: 'The completion is returned to the user' },
    ],
    explanation:
      'A prompt is tokenized, the model generates response tokens, and the assembled text is returned as the completion.',
    refKey: 'modGenAIAgents',
    tags: ['gen-ai', 'tokens'],
  },

  // ------------------------------- match ----------------------------------
  {
    id: 'ai900-d4-201',
    exam: 'AI-900',
    domainId: 'ai900-d4',
    difficulty: 'medium',
    type: 'match',
    prompt: 'Match each natural language processing task to the Azure AI service that provides it.',
    pairs: [
      { left: 'Analyze the sentiment of customer reviews', right: 'Azure AI Language' },
      { left: 'Transcribe a recorded meeting into text', right: 'Azure AI Speech' },
      { left: 'Translate a web page from English to French', right: 'Azure AI Translator' },
    ],
    distractors: ['Azure AI Vision'],
    explanation:
      'Sentiment analysis is an Azure AI Language capability, speech-to-text is Azure AI Speech, and text translation is Azure AI Translator. Azure AI Vision handles images, not text or speech.',
    refKey: 'aiLanguage',
    tags: ['nlp'],
  },
  {
    id: 'ai900-d3-201',
    exam: 'AI-900',
    domainId: 'ai900-d3',
    difficulty: 'medium',
    type: 'match',
    prompt: 'Match each computer vision solution type to its description.',
    pairs: [
      { left: 'Image classification', right: 'Assigns a label to the whole image' },
      { left: 'Object detection', right: 'Locates objects and returns bounding boxes' },
      { left: 'Optical character recognition (OCR)', right: 'Reads printed or handwritten text from images' },
      { left: 'Facial detection', right: 'Detects the presence and location of human faces' },
    ],
    explanation:
      'Classification labels a whole image; object detection adds bounding-box locations; OCR extracts text; facial detection locates faces.',
    refKey: 'aiVision',
    tags: ['vision'],
  },
  {
    id: 'ai901-d1-202',
    exam: 'AI-901',
    domainId: 'ai901-d1',
    difficulty: 'hard',
    type: 'match',
    prompt: 'Match each Microsoft responsible AI principle to the scenario that best reflects it.',
    pairs: [
      { left: 'Fairness', right: 'The model treats applicants of all backgrounds equitably' },
      { left: 'Transparency', right: 'Users are told how the system reaches its decisions' },
      { left: 'Privacy and security', right: "Personal data is protected and users' consent is respected" },
      { left: 'Reliability and safety', right: 'The system keeps operating safely on unexpected input' },
    ],
    explanation:
      'Each scenario maps to one of the six principles: equitable treatment is fairness, explaining decisions is transparency, protecting data is privacy and security, and safe operation under unexpected conditions is reliability and safety.',
    refKey: 'responsibleAI',
    tags: ['responsible-ai'],
  },
  {
    id: 'ai900-d2-202',
    exam: 'AI-900',
    domainId: 'ai900-d2',
    difficulty: 'medium',
    type: 'match',
    prompt: 'Match each machine learning technique to the scenario it best fits.',
    pairs: [
      { left: 'Regression', right: 'Predict the selling price of a house in dollars' },
      { left: 'Classification', right: 'Decide whether an email is spam or not spam' },
      { left: 'Clustering', right: 'Group customers into segments by similar behavior' },
    ],
    distractors: ['Anomaly detection'],
    explanation:
      'Regression predicts a numeric value, classification predicts a category, and clustering groups unlabeled data by similarity.',
    refKey: 'azureML',
    tags: ['ml'],
  },
  {
    id: 'ai901-d1-203',
    exam: 'AI-901',
    domainId: 'ai901-d1',
    difficulty: 'hard',
    type: 'match',
    prompt: 'Match each requirement to the most appropriate type of AI model.',
    pairs: [
      { left: 'Compare how similar two product descriptions are', right: 'Embeddings model' },
      { left: 'Create a new image from a text description', right: 'Image-generation model' },
      { left: 'Transcribe a recorded call into text', right: 'Speech-to-text model' },
      { left: 'Answer questions about an uploaded photo', right: 'Multimodal model' },
    ],
    explanation:
      'Embeddings models measure semantic similarity, image-generation models create images, speech-to-text models transcribe audio, and multimodal models reason over image and text together.',
    refKey: 'modelCatalog',
    tags: ['model-selection'],
  },
  {
    id: 'ai900-d5-202',
    exam: 'AI-900',
    domainId: 'ai900-d5',
    difficulty: 'medium',
    type: 'match',
    prompt: 'Match each generative AI concept to its definition.',
    pairs: [
      { left: 'Token', right: 'A chunk of text a model processes, such as a word or part of a word' },
      { left: 'Grounding', right: 'Supplying relevant source data to reduce hallucinations' },
      { left: 'Fine-tuning', right: 'Retraining a model on your own example data' },
      { left: 'Prompt', right: 'The input text or instruction given to the model' },
    ],
    explanation:
      'Tokens are units of text, grounding adds trusted source data, fine-tuning retrains on custom examples, and a prompt is the input you provide.',
    refKey: 'azureOpenAI',
    tags: ['gen-ai'],
  },
]
