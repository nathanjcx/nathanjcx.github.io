import { prepareWithSegments, layoutWithLines } from 'https://esm.sh/@chenglou/pretext@0.0.4'

const FONT_NORMAL = '300 15px "Helvetica Neue", Helvetica, Arial, sans-serif'
const FONT_BOLD = '500 15px "Helvetica Neue", Helvetica, Arial, sans-serif'
const FONT_HEADING = '300 20px "Helvetica Neue", Helvetica, Arial, sans-serif'
const LINE_HEIGHT = 24

const canvas = document.getElementById('pretext-bio-canvas')
const ctx = canvas.getContext('2d')

let mouseX = -1000
let mouseY = -1000

const BIO_TEXTS = [
    { type: 'heading', text: 'Hello.' },
    { type: 'normal', text: 'My name is Nathan, welcome to my personal website!' },
    { type: 'heading', text: 'Experience' },
    { type: 'bold', text: 'Apple' },
    { type: 'normal', text: 'Developed visionOS video applications and experiences for the Vision Pro.' },
    { type: 'bold', text: 'Microsoft' },
    { type: 'normal', text: 'Focused on Responsible AI and scalable AI agents.' },
    { type: 'bold', text: 'MIT Lincoln Laboratory' },
    { type: 'normal', text: 'Worked with computer vision libraries such as OpenCV to generate CAD.' },
    { type: 'normal', text: 'When I am not coding, I enjoy playing beach volleyball, snowboarding, strumming my guitar, traveling, and spending time with friends and family.' }
]

function render() {
    const style = getComputedStyle(document.body)
    const textColor = style.getPropertyValue('--text-color').trim() || '#333'
    const headingColor = style.getPropertyValue('--text-black').trim() || '#000'

    const dpr = window.devicePixelRatio || 1
    const maxWidth = canvas.clientWidth
    
    // Pre-calculate line layouts with Pretext
    let totalHeight = 20
    const blocksData = BIO_TEXTS.map(block => {
        const font = block.type === 'heading' ? FONT_HEADING : (block.type === 'bold' ? FONT_BOLD : FONT_NORMAL)
        const lineH = block.type === 'heading' ? 32 : LINE_HEIGHT
        const prepared = prepareWithSegments(block.text, font)
        const layout = layoutWithLines(prepared, maxWidth, lineH)
        const spacing = block.type === 'heading' ? 24 : 14
        const blockStart = totalHeight
        totalHeight += layout.height + spacing
        return { block, layout, font, lineH, blockStart }
    })

    canvas.width = Math.floor(maxWidth * dpr)
    canvas.height = Math.floor(totalHeight * dpr)
    canvas.style.height = `${totalHeight}px`
    ctx.setTransform(dpr, 1, 0, dpr, 0, 0) // No, keep it clean
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, maxWidth, totalHeight)

    const AVOID_RADIUS = 50
    const AVOID_STRENGTH = 15

    blocksData.forEach(({ block, layout, font, lineH }) => {
        ctx.font = font
        ctx.fillStyle = (block.type === 'heading' || block.type === 'bold') ? headingColor : textColor
        ctx.textBaseline = 'alphabetic'

        layout.lines.forEach((line, lineIdx) => {
            const chars = [...line.text]
            let charXOffset = 0
            const currentLineBaseY = layout.yLines[lineIdx] + 30 // Approx mapping

            chars.forEach(char => {
                const charWidth = ctx.measureText(char).width
                const charX = charXOffset
                const charY = currentLineBaseY
                
                const dx = charX - mouseX
                const dy = charY - mouseY
                const dist = Math.sqrt(dx * dx + dy * dy)

                let ox = 0
                let oy = 0

                if (dist < AVOID_RADIUS) {
                    const ratio = 1 - (dist / AVOID_RADIUS)
                    ox = (dx / dist) * ratio * AVOID_STRENGTH
                    oy = (dy / dist) * ratio * AVOID_STRENGTH
                }

                ctx.fillText(char, charX + ox, charY + oy)
                charXOffset += charWidth
            })
        })
    })
}

// Global mouse tracker relative to canvas
window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect()
    mouseX = e.clientX - rect.left
    mouseY = e.clientY - rect.top
    render()
})

window.addEventListener('resize', render)

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
    render()
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

// Resume hover state management
document.querySelector('.resume-button').addEventListener('mouseenter', () => {
    document.querySelector('.resume-preview-3d').style.animationPlayState = 'paused'
})
document.querySelector('.resume-button').addEventListener('mouseleave', () => {
    document.querySelector('.resume-preview-3d').style.animationPlayState = 'running'
})

render()
