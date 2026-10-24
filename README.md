# FOCUS: Background Remover
A free open-source API endpoint for removing image backgrounds.

Upload an image, get back a PNG with a transparent background. It runs the U²-Net model locally with ONNX Runtime, so no external services are needed.

### Dev Notes:
Hi! Dev here. This is a simple open-source API tool that you can use on your own end and host on your own machine. This is just a tiny project because I'm tired of using online SaaS that compresses your file too much or limit you too much. Using this, you are in complete control of the whole setup and configurations. Happy tooling!

## Requirements
- Node.js 24 or newer (runs the TypeScript files directly, no build step)

## Run
```bash
npm install
node src/server.ts
```

The server listens on `http://localhost:3000`. The model files are in `src/model/`. If they are missing, download them with:

```bash
node src/scripts/model-download.ts
```

To load settings from `.env`:

```bash
node --env-file=.env src/server.ts
```

### Configuration
Settings are environment variables. Locally, put them in `.env` and start with `--env-file=.env` as shown above. On a host like Render, set them in its dashboard.

**Runtime**

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port to listen on |
| `USE_GPU` | `false` | Use CUDA when `true` (needs an NVIDIA GPU and CUDA; falls back to CPU) |
| `MODEL_PATH` | `./src/model/u2net.onnx` | Model file to load. `u2netp.onnx` is smaller and faster, `u2net.onnx` is more accurate |
| `MAX_CONCURRENT_REQUESTS` | `2` | Images processed at once; extra requests get `503` |
| `RATE_LIMIT_MAX` | `30` | Requests per minute per IP |
| `MAX_FILE_SIZE_MB` | `30` | Largest upload accepted, in megabytes |
| `MAX_PIXELS` | `40000000` | Largest upload accepted by width × height. Larger images get `413` |
| `MAX_IMAGE_DIMENSION` | `0` (off) | Scale uploads down so the longest side is at most this many pixels. The result is returned at the scaled size. Lower it to use less memory |

**Install and build time**

| Variable | Default | Description |
|---|---|---|
| `MODELS` | `u2net.onnx,u2netp.onnx` | Comma separated models the download script fetches. Set it to the model you use to save time and disk |
| `ONNXRUNTIME_NODE_INSTALL_CUDA` | not set | Set to `skip` to avoid downloading the large CUDA libraries when you don't use a GPU |
| `NODE_VERSION` | host default | Node version for hosts like Render. Use 24 or newer |

Example `.env` for a small host (about 512 MB RAM):

```bash
PORT=3000
USE_GPU=false
MODEL_PATH=src/model/u2netp.onnx
MODELS=u2netp.onnx
MAX_CONCURRENT_REQUESTS=1
MAX_FILE_SIZE_MB=25
MAX_IMAGE_DIMENSION=1600
MAX_PIXELS=40000000
RATE_LIMIT_MAX=30
ONNXRUNTIME_NODE_INSTALL_CUDA=skip
NODE_VERSION=24
```

### Deploying on Render
`render.yaml` is a Blueprint for Render's free tier (512 MB RAM). It uses the small `u2netp` model, one image at a time, and scales uploads down to 1600 px on the longest side. If you create the service by hand instead of from the Blueprint, add the same variables in the dashboard. On a larger host, remove those variables to use the full `u2net` model at full resolution.

## Endpoints

### `POST /v1/focus`
Removes the background from an image.

**Request:** `multipart/form-data` with one file field named `image`.

| Limit | Value |
|---|---|
| Formats | JPEG, PNG, WebP |
| File size | `MAX_FILE_SIZE_MB` (default 30 MB) |
| Dimensions | `MAX_PIXELS` (default 40 million pixels) |

```bash
curl -f -F image=@photo.jpg http://localhost:3000/v1/focus -o result.png
```

**Response:** `200` with `Content-Type: image/png`. The image has an alpha channel and keeps its original size, unless `MAX_IMAGE_DIMENSION` is set. Then images larger than that are scaled down.

**Errors** are returned as JSON, `{"error": "message"}`:

| Status | Cause |
|---|---|
| 400 | No file, wrong field name, or a corrupted image |
| 413 | File or image dimensions too large |
| 415 | Unsupported image format |
| 429 | Rate limit exceeded |
| 503 | Server busy, try again shortly |

Use `-f` with curl so an error response isn't saved as `result.png`.

### `GET /health`
Returns `{"status": "ok", "uptime": <seconds>}`.

## License
See [LICENSE](LICENSE).
