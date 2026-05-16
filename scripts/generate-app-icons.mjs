import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const ICON_SIZE = 512;
const SUPERSAMPLE = 3;

const COLORS = {
  paper: [244, 236, 221, 255],
  surface: [251, 247, 239, 255],
  ink: [77, 61, 47, 255],
  orbit: [124, 92, 59, 255],
};

const outputs = [
  ["public/apple-touch-icon.png", 180],
  ["public/icon-192.png", 192],
  ["public/icon-512.png", 512],
];

function crc32(bytes) {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc ^= byte;

    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);

  length.writeUInt32BE(data.length, 0);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])), 0);

  return Buffer.concat([length, typeBytes, data, crc]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);
  const ihdr = Buffer.alloc(13);

  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  const raw = Buffer.alloc((width * 4 + 1) * height);

  for (let y = 0; y < height; y += 1) {
    const rawOffset = y * (width * 4 + 1);
    const rgbaOffset = y * width * 4;

    raw[rawOffset] = 0;
    rgba.copy(raw, rawOffset + 1, rgbaOffset, rgbaOffset + width * 4);
  }

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function blend(buffer, width, x, y, color, alpha = 1) {
  const index = (y * width + x) * 4;
  const sourceAlpha = (color[3] / 255) * alpha;
  const inverseAlpha = 1 - sourceAlpha;

  buffer[index] = Math.round(color[0] * sourceAlpha + buffer[index] * inverseAlpha);
  buffer[index + 1] = Math.round(color[1] * sourceAlpha + buffer[index + 1] * inverseAlpha);
  buffer[index + 2] = Math.round(color[2] * sourceAlpha + buffer[index + 2] * inverseAlpha);
  buffer[index + 3] = 255;
}

function makeCanvas(size) {
  const width = size * SUPERSAMPLE;
  const height = width;
  const buffer = Buffer.alloc(width * height * 4);

  for (let i = 0; i < buffer.length; i += 4) {
    buffer[i] = COLORS.paper[0];
    buffer[i + 1] = COLORS.paper[1];
    buffer[i + 2] = COLORS.paper[2];
    buffer[i + 3] = COLORS.paper[3];
  }

  return { buffer, width, height, scale: width / ICON_SIZE };
}

function drawCircle(canvas, cx, cy, radius, color, alpha = 1) {
  const { buffer, width, height, scale } = canvas;
  const x0 = Math.max(0, Math.floor((cx - radius) * scale));
  const x1 = Math.min(width - 1, Math.ceil((cx + radius) * scale));
  const y0 = Math.max(0, Math.floor((cy - radius) * scale));
  const y1 = Math.min(height - 1, Math.ceil((cy + radius) * scale));
  const scaledCx = cx * scale;
  const scaledCy = cy * scale;
  const scaledRadius = radius * scale;
  const r2 = scaledRadius * scaledRadius;

  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      const dx = x + 0.5 - scaledCx;
      const dy = y + 0.5 - scaledCy;

      if (dx * dx + dy * dy <= r2) {
        blend(buffer, width, x, y, color, alpha);
      }
    }
  }
}

function drawLine(canvas, x1, y1, x2, y2, strokeWidth, color, alpha = 1) {
  const { buffer, width, height, scale } = canvas;
  const ax = x1 * scale;
  const ay = y1 * scale;
  const bx = x2 * scale;
  const by = y2 * scale;
  const radius = (strokeWidth * scale) / 2;
  const minX = Math.max(0, Math.floor(Math.min(ax, bx) - radius));
  const maxX = Math.min(width - 1, Math.ceil(Math.max(ax, bx) + radius));
  const minY = Math.max(0, Math.floor(Math.min(ay, by) - radius));
  const maxY = Math.min(height - 1, Math.ceil(Math.max(ay, by) + radius));
  const vx = bx - ax;
  const vy = by - ay;
  const length2 = vx * vx + vy * vy;
  const radius2 = radius * radius;

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const px = x + 0.5;
      const py = y + 0.5;
      const t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / length2));
      const cx = ax + t * vx;
      const cy = ay + t * vy;
      const dx = px - cx;
      const dy = py - cy;

      if (dx * dx + dy * dy <= radius2) {
        blend(buffer, width, x, y, color, alpha);
      }
    }
  }
}

function drawLineGroup(canvas, segments, strokeWidth, color, alpha = 1) {
  const { buffer, width, height, scale } = canvas;
  const radius = (strokeWidth * scale) / 2;
  const scaledSegments = segments.map(([x1, y1, x2, y2]) => [
    x1 * scale,
    y1 * scale,
    x2 * scale,
    y2 * scale,
  ]);
  const minX = Math.max(
    0,
    Math.floor(Math.min(...scaledSegments.flatMap(([x1, , x2]) => [x1, x2])) - radius),
  );
  const maxX = Math.min(
    width - 1,
    Math.ceil(Math.max(...scaledSegments.flatMap(([x1, , x2]) => [x1, x2])) + radius),
  );
  const minY = Math.max(
    0,
    Math.floor(Math.min(...scaledSegments.flatMap(([, y1, , y2]) => [y1, y2])) - radius),
  );
  const maxY = Math.min(
    height - 1,
    Math.ceil(Math.max(...scaledSegments.flatMap(([, y1, , y2]) => [y1, y2])) + radius),
  );
  const radius2 = radius * radius;

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const px = x + 0.5;
      const py = y + 0.5;
      let covered = false;

      for (const [ax, ay, bx, by] of scaledSegments) {
        const vx = bx - ax;
        const vy = by - ay;
        const length2 = vx * vx + vy * vy;
        const t = Math.max(
          0,
          Math.min(1, ((px - ax) * vx + (py - ay) * vy) / length2),
        );
        const cx = ax + t * vx;
        const cy = ay + t * vy;
        const dx = px - cx;
        const dy = py - cy;

        if (dx * dx + dy * dy <= radius2) {
          covered = true;
          break;
        }
      }

      if (covered) {
        blend(buffer, width, x, y, color, alpha);
      }
    }
  }
}

function downsample(canvas, size) {
  const { buffer, width } = canvas;
  const output = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const totals = [0, 0, 0, 0];

      for (let sy = 0; sy < SUPERSAMPLE; sy += 1) {
        for (let sx = 0; sx < SUPERSAMPLE; sx += 1) {
          const index = ((y * SUPERSAMPLE + sy) * width + x * SUPERSAMPLE + sx) * 4;

          totals[0] += buffer[index];
          totals[1] += buffer[index + 1];
          totals[2] += buffer[index + 2];
          totals[3] += buffer[index + 3];
        }
      }

      const outputIndex = (y * size + x) * 4;
      const sampleCount = SUPERSAMPLE * SUPERSAMPLE;

      output[outputIndex] = Math.round(totals[0] / sampleCount);
      output[outputIndex + 1] = Math.round(totals[1] / sampleCount);
      output[outputIndex + 2] = Math.round(totals[2] / sampleCount);
      output[outputIndex + 3] = Math.round(totals[3] / sampleCount);
    }
  }

  return output;
}

function renderIcon(size) {
  const canvas = makeCanvas(size);

  drawLineGroup(
    canvas,
    [
      [112, 268, 400, 268],
      [112, 228, 112, 308],
      [400, 228, 400, 308],
    ],
    18,
    COLORS.ink,
    0.72,
  );
  drawCircle(canvas, 306, 268, 34, COLORS.ink);

  return encodePng(size, size, downsample(canvas, size));
}

for (const [path, size] of outputs) {
  writeFileSync(path, renderIcon(size));
  console.log(`wrote ${path}`);
}
