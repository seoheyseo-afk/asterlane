import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const iconDir = resolve(root, "public/icons");

const palette = {
  background: "#8D5F68",
  cream: "#F7F0E6",
  vellum: "#FFF9F0",
  rose: "#C7959D",
  blush: "#E8D0D2",
};

const sparkles = [
  { cx: 64, cy: 70, rx: 14, ry: 32, fill: palette.cream, alpha: 0.9, glow: 0.16, rotation: -0.08 },
  { cx: 126, cy: 104, rx: 20, ry: 43, fill: palette.cream, alpha: 0.97, glow: 0.18, rotation: 0.02 },
  { cx: 444, cy: 82, rx: 17, ry: 36, fill: palette.cream, alpha: 0.94, glow: 0.17, rotation: 0.04 },
  { cx: 54, cy: 206, rx: 12, ry: 27, fill: palette.cream, alpha: 0.85, glow: 0.13, rotation: 0.03 },
  { cx: 458, cy: 214, rx: 12, ry: 28, fill: palette.cream, alpha: 0.88, glow: 0.14, rotation: -0.05 },
  { cx: 72, cy: 352, rx: 12, ry: 28, fill: palette.cream, alpha: 0.88, glow: 0.13, rotation: -0.06 },
  { cx: 178, cy: 430, rx: 14, ry: 32, fill: palette.cream, alpha: 0.9, glow: 0.15, rotation: 0.02 },
  { cx: 320, cy: 438, rx: 10, ry: 24, fill: palette.cream, alpha: 0.84, glow: 0.12, rotation: -0.02 },
  { cx: 448, cy: 386, rx: 12, ry: 29, fill: palette.cream, alpha: 0.88, glow: 0.14, rotation: 0.04 },
  { cx: 462, cy: 458, rx: 10, ry: 24, fill: palette.cream, alpha: 0.78, glow: 0.12, rotation: -0.08 },
];

const flowers = [
  {
    cx: 258,
    cy: 252,
    petals: 8,
    petalLength: 88,
    petalWidth: 34,
    fill: palette.cream,
    center: palette.blush,
    rotation: Math.PI / 8,
    alpha: 0.95,
  },
  {
    cx: 144,
    cy: 182,
    petals: 6,
    petalLength: 48,
    petalWidth: 20,
    fill: palette.vellum,
    center: palette.rose,
    rotation: Math.PI / 6,
    alpha: 0.82,
  },
  {
    cx: 372,
    cy: 178,
    petals: 6,
    petalLength: 44,
    petalWidth: 18,
    fill: palette.cream,
    center: palette.blush,
    rotation: Math.PI / 3,
    alpha: 0.78,
  },
  {
    cx: 126,
    cy: 340,
    petals: 7,
    petalLength: 54,
    petalWidth: 21,
    fill: palette.cream,
    center: palette.rose,
    rotation: 0,
    alpha: 0.84,
  },
  {
    cx: 388,
    cy: 342,
    petals: 7,
    petalLength: 60,
    petalWidth: 24,
    fill: palette.vellum,
    center: palette.blush,
    rotation: Math.PI / 7,
    alpha: 0.84,
  },
  {
    cx: 72,
    cy: 132,
    petals: 6,
    petalLength: 34,
    petalWidth: 14,
    fill: palette.blush,
    center: palette.cream,
    rotation: Math.PI / 5,
    alpha: 0.72,
  },
  {
    cx: 440,
    cy: 150,
    petals: 6,
    petalLength: 36,
    petalWidth: 15,
    fill: palette.vellum,
    center: palette.blush,
    rotation: Math.PI / 8,
    alpha: 0.72,
  },
  {
    cx: 58,
    cy: 432,
    petals: 6,
    petalLength: 35,
    petalWidth: 14,
    fill: palette.vellum,
    center: palette.blush,
    rotation: 0,
    alpha: 0.7,
  },
  {
    cx: 424,
    cy: 438,
    petals: 6,
    petalLength: 36,
    petalWidth: 15,
    fill: palette.blush,
    center: palette.cream,
    rotation: Math.PI / 6,
    alpha: 0.72,
  },
];

mkdirSync(iconDir, { recursive: true });

writeFileSync(resolve(iconDir, "asterlane-icon.svg"), createSvg());

for (const size of [32, 180, 192, 512]) {
  const suffix = size === 180 ? "apple-touch-icon" : `icon-${size}`;
  writePng(resolve(iconDir, `asterlane-${suffix}.png`), renderIcon(size));
}

function createSvg() {
  const sparkleGlowMarkup = sparkles
    .map(
      (sparkle) =>
        `<path d="${sparklePath(sparkle, 1.62)}"${rotationAttribute(sparkle)} fill="${sparkle.fill}" fill-opacity="${sparkle.glow.toFixed(2)}"/>`,
    )
    .join("\n    ");

  const sparkleMarkup = sparkles
    .map(
      (sparkle) =>
        `<path d="${sparklePath(sparkle)}"${rotationAttribute(sparkle)} fill="${sparkle.fill}" fill-opacity="${sparkle.alpha.toFixed(2)}"/>`,
    )
    .join("\n    ");

  const flowerMarkup = flowers.map((flower) => createFlowerSvg(flower)).join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Asterlane app icon">
  <rect width="512" height="512" rx="96" fill="${palette.background}"/>
  <g>
    ${sparkleGlowMarkup}
    ${flowerMarkup}
    ${sparkleMarkup}
  </g>
</svg>
`;
}

function createFlowerSvg(flower) {
  const petals = [];
  for (let index = 0; index < flower.petals; index += 1) {
    const angle = flower.rotation + (Math.PI * 2 * index) / flower.petals;
    const distance = flower.petalLength * 0.28;
    const x = flower.cx + Math.cos(angle) * distance;
    const y = flower.cy + Math.sin(angle) * distance;
    petals.push(
      `<ellipse cx="${round(x)}" cy="${round(y)}" rx="${round(flower.petalLength * 0.32)}" ry="${round(
        flower.petalWidth * 0.5,
      )}" transform="rotate(${round((angle * 180) / Math.PI)} ${round(x)} ${round(y)})" fill="${
        flower.fill
      }" fill-opacity="${flower.alpha.toFixed(2)}"/>`,
    );
  }

  return `<g>
      ${petals.join("\n      ")}
      <circle cx="${flower.cx}" cy="${flower.cy}" r="${round(flower.petalWidth * 0.44)}" fill="${
        flower.center
      }"/>
      <circle cx="${flower.cx}" cy="${flower.cy}" r="${round(flower.petalWidth * 0.2)}" fill="${palette.background}" fill-opacity="0.32"/>
    </g>`;
}

function renderIcon(size) {
  const supersample = size <= 64 ? 4 : 3;
  const canvasSize = size * supersample;
  const pixels = new Uint8ClampedArray(canvasSize * canvasSize * 4);
  const scale = canvasSize / 512;

  fill(pixels, canvasSize, hexToRgb(palette.background));

  for (const sparkle of sparkles) {
    drawSparkle(pixels, canvasSize, scale, sparkle, 1.62, sparkle.glow);
  }

  for (const flower of flowers) {
    drawFlower(pixels, canvasSize, scale, flower);
  }

  for (const sparkle of sparkles) {
    drawSparkle(pixels, canvasSize, scale, sparkle, 1, sparkle.alpha);
  }

  return downsample(pixels, canvasSize, supersample, size);
}

function drawSparkle(pixels, canvasSize, scale, sparkle, multiplier, alpha) {
  drawPolygon(pixels, canvasSize, scale, sparklePoints(sparkle, multiplier), hexToRgb(sparkle.fill), alpha);
}

function drawFlower(pixels, canvasSize, scale, flower) {
  for (let index = 0; index < flower.petals; index += 1) {
    const angle = flower.rotation + (Math.PI * 2 * index) / flower.petals;
    const distance = flower.petalLength * 0.28;
    drawEllipse(
      pixels,
      canvasSize,
      scale,
      flower.cx + Math.cos(angle) * distance,
      flower.cy + Math.sin(angle) * distance,
      flower.petalLength * 0.32,
      flower.petalWidth * 0.5,
      angle,
      hexToRgb(flower.fill),
      flower.alpha,
    );
  }

  drawEllipse(
    pixels,
    canvasSize,
    scale,
    flower.cx,
    flower.cy,
    flower.petalWidth * 0.44,
    flower.petalWidth * 0.44,
    0,
    hexToRgb(flower.center),
    1,
  );
  drawEllipse(
    pixels,
    canvasSize,
    scale,
    flower.cx,
    flower.cy,
    flower.petalWidth * 0.2,
    flower.petalWidth * 0.2,
    0,
    hexToRgb(palette.background),
    0.32,
  );
}

function drawEllipse(pixels, canvasSize, scale, cx, cy, rx, ry, rotation, rgb, alpha) {
  const scaledCx = cx * scale;
  const scaledCy = cy * scale;
  const scaledRx = rx * scale;
  const scaledRy = ry * scale;
  const radius = Math.ceil(Math.max(scaledRx, scaledRy));
  const minX = Math.max(0, Math.floor(scaledCx - radius - 1));
  const maxX = Math.min(canvasSize - 1, Math.ceil(scaledCx + radius + 1));
  const minY = Math.max(0, Math.floor(scaledCy - radius - 1));
  const maxY = Math.min(canvasSize - 1, Math.ceil(scaledCy + radius + 1));
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const dx = x + 0.5 - scaledCx;
      const dy = y + 0.5 - scaledCy;
      const localX = dx * cos + dy * sin;
      const localY = -dx * sin + dy * cos;
      if ((localX * localX) / (scaledRx * scaledRx) + (localY * localY) / (scaledRy * scaledRy) <= 1) {
        blendPixel(pixels, canvasSize, x, y, rgb, alpha);
      }
    }
  }
}

function drawPolygon(pixels, canvasSize, scale, points, rgb, alpha) {
  const scaledPoints = points.map(([x, y]) => [x * scale, y * scale]);
  const xs = scaledPoints.map(([x]) => x);
  const ys = scaledPoints.map(([, y]) => y);
  const minX = Math.max(0, Math.floor(Math.min(...xs)));
  const maxX = Math.min(canvasSize - 1, Math.ceil(Math.max(...xs)));
  const minY = Math.max(0, Math.floor(Math.min(...ys)));
  const maxY = Math.min(canvasSize - 1, Math.ceil(Math.max(...ys)));

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      if (pointInPolygon(x + 0.5, y + 0.5, scaledPoints)) {
        blendPixel(pixels, canvasSize, x, y, rgb, alpha);
      }
    }
  }
}

function pointInPolygon(x, y, points) {
  let inside = false;
  for (let current = 0, previous = points.length - 1; current < points.length; previous = current, current += 1) {
    const [currentX, currentY] = points[current];
    const [previousX, previousY] = points[previous];
    const intersects =
      currentY > y !== previousY > y &&
      x < ((previousX - currentX) * (y - currentY)) / (previousY - currentY) + currentX;
    if (intersects) inside = !inside;
  }
  return inside;
}

function sparklePath(sparkle, multiplier = 1) {
  return sparkleSegments(sparkle, multiplier)
    .map((segment, index) => {
      const [start, controlA, controlB, end] = segment;
      if (index === 0) {
        return `M ${round(start[0])} ${round(start[1])} C ${round(controlA[0])} ${round(controlA[1])} ${round(
          controlB[0],
        )} ${round(controlB[1])} ${round(end[0])} ${round(end[1])}`;
      }

      return `C ${round(controlA[0])} ${round(controlA[1])} ${round(controlB[0])} ${round(controlB[1])} ${round(
        end[0],
      )} ${round(end[1])}`;
    })
    .join(" ")
    .concat(" Z");
}

function sparkleSegments({ cx, cy, rx, ry }, multiplier = 1) {
  const width = rx * multiplier;
  const height = ry * multiplier;

  return [
    [
      [cx, cy - height],
      [cx + width * 0.1, cy - height * 0.34],
      [cx + width * 0.18, cy - height * 0.06],
      [cx + width, cy],
    ],
    [
      [cx + width, cy],
      [cx + width * 0.18, cy + height * 0.06],
      [cx + width * 0.1, cy + height * 0.34],
      [cx, cy + height],
    ],
    [
      [cx, cy + height],
      [cx - width * 0.1, cy + height * 0.34],
      [cx - width * 0.18, cy + height * 0.06],
      [cx - width, cy],
    ],
    [
      [cx - width, cy],
      [cx - width * 0.18, cy - height * 0.06],
      [cx - width * 0.1, cy - height * 0.34],
      [cx, cy - height],
    ],
  ];
}

function sparklePoints(sparkle, multiplier = 1) {
  const steps = 18;
  const points = [];

  for (const segment of sparkleSegments(sparkle, multiplier)) {
    const start = points.length === 0 ? 0 : 1;
    for (let step = start; step <= steps; step += 1) {
      const point = cubicPoint(segment[0], segment[1], segment[2], segment[3], step / steps);
      points.push(rotatePoint(point, sparkle.cx, sparkle.cy, sparkle.rotation ?? 0));
    }
  }

  return points;
}

function cubicPoint(start, controlA, controlB, end, t) {
  const inverse = 1 - t;
  const startWeight = inverse * inverse * inverse;
  const controlAWeight = 3 * inverse * inverse * t;
  const controlBWeight = 3 * inverse * t * t;
  const endWeight = t * t * t;

  return [
    start[0] * startWeight + controlA[0] * controlAWeight + controlB[0] * controlBWeight + end[0] * endWeight,
    start[1] * startWeight + controlA[1] * controlAWeight + controlB[1] * controlBWeight + end[1] * endWeight,
  ];
}

function rotatePoint(point, cx, cy, rotation) {
  if (!rotation) return point;

  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const x = point[0] - cx;
  const y = point[1] - cy;

  return [cx + x * cos - y * sin, cy + x * sin + y * cos];
}

function rotationAttribute(sparkle) {
  if (!sparkle.rotation) return "";
  return ` transform="rotate(${round((sparkle.rotation * 180) / Math.PI)} ${sparkle.cx} ${sparkle.cy})"`;
}

function fill(pixels, canvasSize, rgb) {
  for (let y = 0; y < canvasSize; y += 1) {
    for (let x = 0; x < canvasSize; x += 1) {
      const offset = (y * canvasSize + x) * 4;
      pixels[offset] = rgb.r;
      pixels[offset + 1] = rgb.g;
      pixels[offset + 2] = rgb.b;
      pixels[offset + 3] = 255;
    }
  }
}

function blendPixel(pixels, canvasSize, x, y, rgb, alpha) {
  const offset = (y * canvasSize + x) * 4;
  const inverse = 1 - alpha;
  pixels[offset] = Math.round(rgb.r * alpha + pixels[offset] * inverse);
  pixels[offset + 1] = Math.round(rgb.g * alpha + pixels[offset + 1] * inverse);
  pixels[offset + 2] = Math.round(rgb.b * alpha + pixels[offset + 2] * inverse);
  pixels[offset + 3] = 255;
}

function downsample(source, canvasSize, supersample, targetSize) {
  const target = Buffer.alloc(targetSize * targetSize * 4);
  const samples = supersample * supersample;

  for (let y = 0; y < targetSize; y += 1) {
    for (let x = 0; x < targetSize; x += 1) {
      let red = 0;
      let green = 0;
      let blue = 0;
      let alpha = 0;

      for (let sampleY = 0; sampleY < supersample; sampleY += 1) {
        for (let sampleX = 0; sampleX < supersample; sampleX += 1) {
          const sourceOffset = ((y * supersample + sampleY) * canvasSize + x * supersample + sampleX) * 4;
          red += source[sourceOffset];
          green += source[sourceOffset + 1];
          blue += source[sourceOffset + 2];
          alpha += source[sourceOffset + 3];
        }
      }

      const targetOffset = (y * targetSize + x) * 4;
      target[targetOffset] = Math.round(red / samples);
      target[targetOffset + 1] = Math.round(green / samples);
      target[targetOffset + 2] = Math.round(blue / samples);
      target[targetOffset + 3] = Math.round(alpha / samples);
    }
  }

  return target;
}

function writePng(path, rgba) {
  mkdirSync(dirname(path), { recursive: true });
  const size = Math.sqrt(rgba.length / 4);
  const scanlines = Buffer.alloc((size * 4 + 1) * size);

  for (let y = 0; y < size; y += 1) {
    const rowStart = y * (size * 4 + 1);
    scanlines[rowStart] = 0;
    Buffer.from(rgba.buffer, rgba.byteOffset + y * size * 4, size * 4).copy(scanlines, rowStart + 1);
  }

  const chunks = [
    pngChunk("IHDR", ihdr(size, size)),
    pngChunk("IDAT", deflateSync(scanlines)),
    pngChunk("IEND", Buffer.alloc(0)),
  ];

  writeFileSync(path, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), ...chunks]));
}

function ihdr(width, height) {
  const buffer = Buffer.alloc(13);
  buffer.writeUInt32BE(width, 0);
  buffer.writeUInt32BE(height, 4);
  buffer[8] = 8;
  buffer[9] = 6;
  buffer[10] = 0;
  buffer[11] = 0;
  buffer[12] = 0;
  return buffer;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function round(value) {
  return Number(value.toFixed(2));
}
