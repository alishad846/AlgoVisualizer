import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildCorpus } from './corpus.js';
import { trainNaiveBayes } from './naiveBayesTrain.js';
import { tokenize } from '../../src/utils/codeTokenizer.js';
import { predictCategory } from '../../src/utils/naiveBayesPredict.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '..', '..', 'src', 'data', 'algoDetectorModel.json');

function shuffleInPlace(array, seedSource) {
  // deterministic shuffle so re-running the script is reproducible
  let seed = seedSource;
  for (let i = array.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function main() {
  const { texts, labels } = buildCorpus();
  const indices = texts.map((_, i) => i);
  shuffleInPlace(indices, 42);

  const splitPoint = Math.floor(indices.length * 0.8);
  const trainIdx = indices.slice(0, splitPoint);
  const testIdx = indices.slice(splitPoint);

  const trainDocs = trainIdx.map((i) => tokenize(texts[i]));
  const trainLabels = trainIdx.map((i) => labels[i]);

  const model = trainNaiveBayes(trainDocs, trainLabels);

  let correct = 0;
  testIdx.forEach((i) => {
    const prediction = predictCategory(tokenize(texts[i]), model);
    if (prediction.category === labels[i]) correct += 1;
  });
  const accuracy = testIdx.length > 0 ? correct / testIdx.length : 1;

  writeFileSync(OUTPUT_PATH, JSON.stringify(model, null, 2));

  console.log(`Trained on ${trainDocs.length} samples, held out ${testIdx.length}.`);
  console.log(`Held-out accuracy: ${(accuracy * 100).toFixed(1)}%`);
  console.log(`Model written to ${OUTPUT_PATH}`);
}

main();
