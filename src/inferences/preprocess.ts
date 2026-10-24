import sharp from 'sharp';
import * as ort from 'onnxruntime-node';

export async function preprocessImage(
    buffer: Buffer,
    { size, mean, std }: { size: number; mean: number[]; std: number[] },
    maxDimension = 0,
) {
    let image = sharp(buffer).rotate();
    if (maxDimension > 0) {
        image = image.resize({ width: maxDimension, height: maxDimension, fit: 'inside', withoutEnlargement: true });
    }
    const { data, info } = await image
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const original = { data, width: info.width, height: info.height };

    const resized = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
        .removeAlpha()
        .resize(size, size, { fit: 'fill' })
        .raw()
        .toBuffer();

    const plane = size * size;
    const float32Data = new Float32Array(3 * plane);
    for (let i = 0; i < plane; i++) {
        for (let c = 0; c < 3; c++) {
            float32Data[c * plane + i] = (resized[i * 3 + c] / 255 - mean[c]) / std[c];
        }
    }

    return {
        tensor: new ort.Tensor('float32', float32Data, [1, 3, size, size]),
        original,
    };
}
