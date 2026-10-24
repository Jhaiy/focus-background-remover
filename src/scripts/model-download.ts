import { createWriteStream } from 'node:fs';
import { access, mkdir, rename } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const BASE = 'https://github.com/danielgatis/rembg/releases/download/v0.0.0';
const MODELS = ['u2net.onnx', 'u2netp.onnx'];
const DIR = new URL('../model/', import.meta.url);

await mkdir(DIR, { recursive: true });

for (const name of MODELS) {
    const target = new URL(name, DIR);
    try {
        await access(target);
        console.log(`${name} already present, skipping`);
        continue;
    } catch {}

    console.log(`Downloading ${name}...`);
    const res = await fetch(`${BASE}/${name}`);
    if (!res.ok || !res.body) throw new Error(`Failed to download ${name}: ${res.status}`);

    const tmp = new URL(`${name}.part`, DIR);
    await pipeline(Readable.fromWeb(res.body as any), createWriteStream(tmp));
    await rename(tmp, target);
    console.log(`Saved ${name}`);
}
