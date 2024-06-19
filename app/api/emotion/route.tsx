import { HfInference, TextClassificationOutput } from '@huggingface/inference'

let hf: HfInference;

export async function POST(req: Request, res: Response) {
    const {input} = await req.json();
    const inferenceResponse: TextClassificationOutput = await runInference(input);
  
    // filtering data such that if next score is at least half of the previous, that emotion 
    //and subsequent are filtered out
    const filteredResponse = filterResponses([...inferenceResponse])

    
    return new Response(JSON.stringify({inferenceResponse, filteredResponse}), {status : 200})
}
function filterResponses(emotions: TextClassificationOutput) {
    const filtered = []
    const emotion0 = emotions.shift();

    filtered.push(emotion0); // push first emotion onto array
    let score = emotion0?.score;
    while (emotions.length > 0) {
        const emotionI = emotions.shift(); 
        if (emotionI?.score! > score!*0.5) {
            filtered.push(emotionI);
            score = emotionI?.score!;
        }else {
            break;
        }

    }
    return filtered;
}

async function runInference(input:string) {
    if (!hf) {
        hf = new HfInference(process.env.HF_TOKEN)

    }
    const modelName = 'SamLowe/roberta-base-go_emotions';
    const inferenceRes = await hf.textClassification({
        model: modelName, inputs: input
    }); 
    return inferenceRes; 
}