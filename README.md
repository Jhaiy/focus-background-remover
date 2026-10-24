# focus-background-remover
A free open-source API endpoint for removing image backgrounds.

Upload an image, get back a PNG with a transparent background. It runs the U²-Net model locally with ONNX Runtime, so no external services are needed.

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
