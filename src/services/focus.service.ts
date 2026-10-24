import { config } from '../config/config.ts';
import { getSession } from '../inferences/session.ts';
import { preprocessImage } from '../inferences/preprocess.ts';
import { postprocessImage } from '../inferences/postprocess.ts';
import { createLimiter } from '../inferences/limiter.ts';

const limit = createLimiter(config.maxConcurrentRequests);

export async function removeBackground(imageBuffer: Buffer): Promise<Buffer> {
    return limit(async () => {
        const { tensor, original } = await preprocessImage(imageBuffer, config.model, config.maxImageDimension);
        const session = getSession();
        const output = await session.run({ [session.inputNames[0]]: tensor });
        return postprocessImage(output[session.outputNames[0]], original);
    })
}
