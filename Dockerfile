FROM node:26-slim

# Hugging Face Spaces runs the container as user id 1000, which is "node" in this image.
USER node
WORKDIR /home/node/app

ENV PORT=7860 \
    NODE_ENV=production \
    ONNXRUNTIME_NODE_INSTALL_CUDA=skip

# Install dependencies. postinstall downloads the models; the script is copied
# first so this layer stays cached when only the app code changes.
COPY --chown=node:node package*.json ./
COPY --chown=node:node src/scripts ./src/scripts
RUN npm ci

COPY --chown=node:node . .

EXPOSE 7860
CMD ["npm", "start"]
