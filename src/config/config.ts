export const config = {
    port: Number(process.env.PORT ?? 3000),
    modelPath: process.env.MODEL_PATH ?? './src/model/u2net.onnx',
    useGpu: process.env.USE_GPU === 'true',
    maxConcurrentRequests: Number(process.env.MAX_CONCURRENT_REQUESTS ?? 2),
    maxFileSize: Number(process.env.MAX_FILE_SIZE_MB ?? 30) * 1024 * 1024,
    maxPixels: Number(process.env.MAX_PIXELS ?? 40_000_000),
    maxImageDimension: Number(process.env.MAX_IMAGE_DIMENSION ?? 0),
    allowedFormats: ['jpeg', 'png', 'webp'],
    rateLimit: {
        windowMs: 60_000,
        max: Number(process.env.RATE_LIMIT_MAX ?? 30),
    },
    model: {
        size: 320,
        mean: [0.485, 0.456, 0.406],
        std: [0.229, 0.224, 0.225],
    },
};
