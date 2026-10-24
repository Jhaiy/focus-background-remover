# focus-background-remover
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
| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port to listen on |
| `USE_GPU` | `false` | Use CUDA when `true` (falls back to CPU) |
| `MAX_CONCURRENT_REQUESTS` | `2` | Images processed at once; extra requests get `503` |
| `RATE_LIMIT_MAX` | `30` | Requests per minute per IP |
| `MODEL_PATH` | `./src/model/u2net.onnx` | Model file to load |
| `MODELS` | `u2net.onnx,u2netp.onnx` | Models the download script fetches |
| `MAX_FILE_SIZE_MB` | `30` | Largest upload accepted |
| `MAX_PIXELS` | `40000000` | Largest image (width × height) accepted |

### Deploying on Render
`render.yaml` is a Blueprint for Render's free tier (512 MB RAM). It uses the small `u2netp` model, one image at a time, and a 12 megapixel limit. On a larger host, remove those variables to use the full `u2net` model.

## Endpoints

### `POST /v1/focus`
Removes the background from an image.

**Request:** `multipart/form-data` with one file field named `image`.

| Limit | Value |
|---|---|
| Formats | JPEG, PNG, WebP |
| File size | 30 MB |
| Dimensions | 40 million pixels |

```bash
curl -f -F image=@photo.jpg http://localhost:3000/v1/focus -o result.png
```

**Response:** `200` with `Content-Type: image/png`. The image keeps its original size and has an alpha channel.

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
