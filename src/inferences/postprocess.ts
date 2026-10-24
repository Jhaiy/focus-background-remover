import sharp from 'sharp';
import * as ort from 'onnxruntime-node';

export async function postprocessImage(output: ort.Tensor, original: { data: Buffer; width: number; height: number }) {
    const [, , height, width] = output.dims;
    const raw = output.data as Float32Array;

    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < raw.length; i++) {
        if (raw[i] < min) min = raw[i];
        if (raw[i] > max) max = raw[i];
    }

    const range = max - min || 1;
    const mask = Buffer.alloc(raw.length);
    for (let i = 0; i < raw.length; i++) {
        mask[i] = Math.round(((raw[i] - min) / range) * 255);
    }

    const alpha = await sharp(mask, { raw: { width: width, height: height, channels: 1 } })
        .resize(original.width, original.height, { fit: 'fill', kernel: 'lanczos3' })
        .extractChannel(0)
        .raw()
        .toBuffer();

    const rgba = original.data;
    for (let i = 0; i < alpha.length; i++) {
        rgba[i * 4 + 3] = alpha[i];
    }

    return sharp(rgba, {
        raw: { width: original.width, height: original.height, channels: 4 },
    })
        .png()
        .toBuffer();
}