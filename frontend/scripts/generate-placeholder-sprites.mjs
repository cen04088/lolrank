// 개발용 placeholder 픽셀 아바타(16x16 PNG) 생성 스크립트.
// 실제 에셋은 public/assets/players/player_XX.png 를 교체하면 된다.
// 실행: node scripts/generate-placeholder-sprites.mjs
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'assets', 'players')
const SIZE = 16
const COUNT = 12

const JERSEYS = [
  ['#e63946', '#ffffff'], ['#1d4ed8', '#ffffff'], ['#16a34a', '#fde047'], ['#f59e0b', '#1f2937'],
  ['#7c3aed', '#ffffff'], ['#0ea5e9', '#0f172a'], ['#f472b6', '#ffffff'], ['#f8fafc', '#e63946'],
  ['#0f172a', '#facc15'], ['#dc2626', '#0f172a'], ['#22d3ee', '#ffffff'], ['#a16207', '#ffffff'],
]
const SKINS = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#ffdbac', '#f1c27d']
const HAIRS = ['#1f1f1f', '#4a2c17', '#d4a017', '#8b0000', '#2b2b2b', '#5b3a29']

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crc])
}

function hex(color) {
  const v = color.replace('#', '')
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]
}

function encodePng(pixels) {
  const raw = Buffer.alloc((SIZE * 4 + 1) * SIZE)
  for (let y = 0; y < SIZE; y++) {
    raw[y * (SIZE * 4 + 1)] = 0
    for (let x = 0; x < SIZE; x++) {
      const color = pixels[y][x]
      const offset = y * (SIZE * 4 + 1) + 1 + x * 4
      if (color) {
        const [r, g, b] = hex(color)
        raw[offset] = r
        raw[offset + 1] = g
        raw[offset + 2] = b
        raw[offset + 3] = 255
      }
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(SIZE, 0)
  ihdr.writeUInt32BE(SIZE, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function drawPlayer(index) {
  const [jersey, stripe] = JERSEYS[index % JERSEYS.length]
  const skin = SKINS[index % SKINS.length]
  const hair = HAIRS[(index * 7) % HAIRS.length]
  const shorts = index % 3 === 0 ? '#ffffff' : '#1f2937'
  const boots = '#111111'
  const outline = '#0b0b0b'
  const px = Array.from({ length: SIZE }, () => Array(SIZE).fill(null))
  const fill = (x0, y0, x1, y1, color) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) px[y][x] = color
  }

  // hair + head
  fill(5, 1, 10, 2, hair)
  fill(4, 2, 4, 3, hair)
  fill(11, 2, 11, 3, hair)
  fill(5, 3, 10, 6, skin)
  if (index % 4 === 1) fill(5, 3, 10, 3, hair) // 앞머리
  px[5][6] = outline
  px[5][9] = outline
  fill(7, 6, 8, 6, '#c0392b') // 입
  // neck
  fill(7, 7, 8, 7, skin)
  // jersey
  fill(4, 8, 11, 12, jersey)
  fill(3, 8, 3, 9, jersey) // sleeves
  fill(12, 8, 12, 9, jersey)
  fill(2, 10, 2, 11, skin) // arms
  fill(13, 10, 13, 11, skin)
  if (index % 2 === 0) fill(7, 8, 8, 12, stripe) // 세로 스트라이프
  else fill(4, 10, 11, 10, stripe) // 가로 스트라이프
  // shorts
  fill(5, 13, 10, 13, shorts)
  // legs & boots
  fill(5, 14, 6, 14, skin)
  fill(9, 14, 10, 14, skin)
  fill(5, 15, 6, 15, boots)
  fill(9, 15, 10, 15, boots)
  return px
}

mkdirSync(OUT_DIR, { recursive: true })
for (let i = 0; i < COUNT; i++) {
  const key = `player_${String(i + 1).padStart(2, '0')}`
  writeFileSync(join(OUT_DIR, `${key}.png`), encodePng(drawPlayer(i)))
}
console.log(`generated ${COUNT} sprites in ${OUT_DIR}`)
