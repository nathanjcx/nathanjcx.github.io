import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

const FONT = '300 16px "Helvetica Neue", Helvetica, Arial, sans-serif'
const LINE_HEIGHT = 26
const SAMPLE =
  'AGI 春天到了. بدأت الرحلة 🚀 — Multiline layout with zero DOM measurement. Resize the slider.'

const canvas = document.getElementById('pretext-canvas')
const ctx = canvas.getContext('2d')
const widthRange = document.getElementById('pretext-width')
const widthLabel = document.getElementById('pretext-width-label')
const stats = document.getElementById('pretext-stats')

function render() {
  const maxWidth = Number(widthRange.value)
  widthLabel.textContent = `${maxWidth}px`

  const prepared = prepareWithSegments(SAMPLE, FONT)
  const { height, lineCount, lines } = layoutWithLines(prepared, maxWidth, LINE_HEIGHT)

  const h = Math.max(Math.ceil(height) + 8, LINE_HEIGHT)
  const dpr = window.devicePixelRatio || 1

  canvas.style.width = `${maxWidth}px`
  canvas.style.height = `${h}px`
  canvas.width = Math.floor(maxWidth * dpr)
  canvas.height = Math.floor(h * dpr)

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  ctx.fillStyle = '#fafafa'
  ctx.fillRect(0, 0, maxWidth, h)

  ctx.font = FONT
  ctx.fillStyle = '#333'
  ctx.textBaseline = 'alphabetic'

  let y = 20
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i].text, 4, y)
    y += LINE_HEIGHT
  }

  stats.textContent = `${lineCount} lines · ${height.toFixed(1)}px tall · no getBoundingClientRect`
}

render()
widthRange.addEventListener('input', render)
window.addEventListener('resize', render)
