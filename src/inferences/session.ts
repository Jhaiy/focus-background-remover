import * as ort from 'onnxruntime-node';
import { config } from '../config/config.ts';

let session: ort.InferenceSession | null = null;

export async function loadSession() {
    session = await ort.InferenceSession.create(config.modelPath, {
        executionProviders: config.useGpu ? ['cuda', 'cpu'] : ['cpu'],
        graphOptimizationLevel: 'all',
    });

    const { size } = config.model;
    const dummy = new ort.Tensor('float32', new Float32Array(size * size * 3), [1, 3, size, size]);
    await session.run ({[session.inputNames[0]]: dummy});
}

export function getSession() {
    if (!session) throw new Error('ONNX Runtime session has not been initialized. Call loadSession() first.');
    return session;
}