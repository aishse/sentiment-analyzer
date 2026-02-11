import { HfInference } from '@huggingface/inference'

// Lazy initialization to avoid heavy module-level initialization during build
let hf: HfInference | null = null;

function getHfInstance(): HfInference {
  if (!hf) {
    hf = new HfInference(process.env.HF_TOKEN);
  }
  return hf;
}

type Emotion = {
  label: string;
  score: number;
};

// Force dynamic rendering to prevent build-time analysis
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { input } = await req.json();
    
    if (!input || typeof input !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid input. Expected a string.' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const inferenceResponse = await runInference(input);
  
    // filtering data such that if next score is at least half of the previous, that emotion 
    //and subsequent are filtered out
    const filteredResponse = filterResponses([...inferenceResponse]);

    return new Response(
      JSON.stringify({ inferenceResponse, filteredResponse }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in emotion API route:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

function filterResponses(emotions: Emotion[]): Emotion[] {
  const filtered: Emotion[] = [];
  const emotion0 = emotions.shift();

  if (!emotion0) {
    return filtered;
  }

  filtered.push(emotion0); // push first emotion onto array
  let score = emotion0.score;
  
  while (emotions.length > 0) {
    const emotionI = emotions.shift(); 
    if (emotionI && emotionI.score > score * 0.45) {
      filtered.push(emotionI);
      score = emotionI.score;
    } else {
      break;
    }
  }
  
  return filtered;
}

async function runInference(input: string): Promise<Emotion[]> {
  const modelName = "SamLowe/roberta-base-go_emotions";
  const hfInstance = getHfInstance();

  const result = await hfInstance.textClassification({
    model: modelName,
    inputs: input
  });

  return result as Emotion[];
}

