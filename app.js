import { prepareWithSegments, layoutWithLines } from 'https://esm.sh/@chenglou/pretext@0.0.4'

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

  // Use CSS variables for theming support
  const style = getComputedStyle(document.body)
  const canvasBg = style.getPropertyValue('--canvas-bg').trim() || '#fafafa'
  const textColor = style.getPropertyValue('--text-color').trim() || '#333'

  ctx.fillStyle = canvasBg
  ctx.fillRect(0, 0, maxWidth, h)

  ctx.font = FONT
  ctx.fillStyle = textColor
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

// Theme Toggle Logic
const themeToggle = document.getElementById('theme-toggle')
let currentTheme = localStorage.getItem('theme') || 
                   (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

function setTheme(theme) {
    if (theme === 'dark') {
        document.body.setAttribute('data-theme', 'dark')
    } else {
        document.body.removeAttribute('data-theme')
    }
    localStorage.setItem('theme', theme)
    render() // Redraw canvas on theme change
}

setTheme(currentTheme)

themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark'
    setTheme(currentTheme)
})

// Email Popup Logic
const emailBtn = document.getElementById('email-btn')
const emailPopup = document.getElementById('email-popup')
const copyEmailBtn = document.getElementById('copy-email-btn')

emailBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    emailPopup.classList.toggle('hidden')
})

copyEmailBtn.addEventListener('click', () => {
    const email = 'nathanjcx@gmail.com'
    const copyIcon = copyEmailBtn.querySelector('.copy-icon')
    const checkIcon = copyEmailBtn.querySelector('.check-icon')

    navigator.clipboard.writeText(email).then(() => {
        copyIcon.classList.add('hidden')
        checkIcon.classList.remove('hidden')
        setTimeout(() => {
            copyIcon.classList.remove('hidden')
            checkIcon.classList.add('hidden')
        }, 2000)
    })
})

document.addEventListener('click', (e) => {
    if (!emailPopup.contains(e.target) && e.target !== emailBtn) {
        emailPopup.classList.add('hidden')
    }
})
