/// <reference lib="webworker" />

import { dev } from '$app/environment';
import * as nsfwjs from 'nsfwjs';
import * as tf from '@tensorflow/tfjs';
import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-backend-wasm';

// set local wasm paths for tfjs
setWasmPaths('/tfjs-wasm/');
if (!dev) tf.enableProdMode();

let model: nsfwjs.NSFWJS | null = null;

export async function loadModel() {
  // set backend to wasm and wait for it to be ready
  await tf.setBackend('wasm');
  await tf.ready();

  // load model from cache or fetch and cache it
  try {
    model = await nsfwjs.load('indexeddb://nsfw-model');
  } catch (error) {
    model = await nsfwjs.load('/models/nsfw-model/MobileNetV2/model.json');
    await model.model.save('indexeddb://nsfw-model');
  }

  // warmup
  const dummy = tf.zeros<tf.Rank.R3>([224, 224, 3]);
  await model.classify(dummy);
  dummy.dispose();

  postMessage({ type: 'ready' });
}

async function scan(imageData: ImageData) {
  if (!model) return;

  const tensor = tf.browser.fromPixels(imageData);

  const predictions = await model.classify(tensor);

  tensor.dispose();

  postMessage({ type: 'result', predictions });
}

self.onmessage = async (e) => {
  const { type, payload } = e.data;

  if (type === 'init') {
    loadModel();
  }

  if (type === 'scan') {
    scan(payload);
  }
};
