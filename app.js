import { prepareWithSegments, layoutWithLines } from 'https://esm.sh/@chenglou/pretext@0.0.4'

const FONT_NORMAL = '300 15px "Helvetica Neue", Helvetica, Arial, sans-serif'
const FONT_BOLD = '500 15px "Helvetica Neue", Helvetica, Arial, sans-serif'
const FONT_HEADING = '300 20px "Helvetica Neue", Helvetica, Arial, sans-serif'
const LINE_HEIGHT = 24

const canvas = document.getElementById('pretext-bio-canvas')
const ctx = canvas.getContext('2d')
const container = document.querySelector('.container')

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
    const highlightedColor = style.getPropertyValue('--text-black').trim() || '#000'

    const dpr = window.devicePixelRatio || 1
    const maxWidth = canvas.clientWidth
    
    // Initial height calculation
    let totalHeight = 20
    const preparedBlocks = BIO_TEXTS.map(block => {
        let font = FONT_NORMAL
        if (block.type === 'heading') font = FONT_HEADING
        if (block.type === 'bold') font = FONT_BOLD
        
        const prepared = prepareWithSegments(block.text, font)
        const layout = layoutWithLines(prepared, maxWidth, block.type === 'heading' ? 32 : LINE_HEIGHT)
        totalHeight += layout.height + (block.type === 'heading' ? 20 : 10)
        return { block, prepared, layout, font, spacing: (block.type === 'heading' ? 20 : 10) }
    })

    canvas.width = Math.floor(maxWidth * dpr)
    canvas.height = Math.floor(totalHeight * dpr)
    canvas.style.height = `${totalHeight}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    ctx.clearRect(0, 0, maxWidth, totalHeight)

    let currentY = 30
    const AVOID_RADIUS = 60
    const AVOID_STRENGTH = 40

    preparedBlocks.forEach(({ block, layout, font, spacing }) => {
        ctx.font = font
        ctx.fillStyle = (block.type === 'heading' || block.type === 'bold') ? headingColor : textColor
        ctx.textBaseline = 'alphabetic'

        layout.lines.forEach(line => {
            // "Avoid" logic per word if possible, or per line for start
            // To make it look like pretext style, we displace the entire line or segments.
            
            const lineX = 0
            const midY = currentY - (LINE_HEIGHT / 2)
            
            const dx = (lineX + maxWidth / 2) - mouseX
            const dy = midY - mouseY
            const dist = Math.sqrt(dx * dx + dy * dy)

            let offsetX = 0
            let offsetY = 0

            if (dist < AVOID_RADIUS) {
                const force = (AVOID_RADIUS - dist) / AVOID_RADIUS
                offsetX = (dx / dist) * force * AVOID_STRENGTH
                offsetY = (dy / dist) * force * AVOID_STRENGTH
            }

            // Draw line with displacement
            ctx.fillText(line.text, lineX + offsetX, currentY + offsetY)
            currentY += (block.type === 'heading' ? 32 : LINE_HEIGHT)
        })
        currentY += spacing
    })
}

// Initial render and events
window.addEventListener('resize', render)
window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect()
    mouseX = e.clientX - rect.left
    mouseY = e.clientY - rect.top
    render()
})

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

// Fix for resume hover
document.querySelector('.resume-button').addEventListener('mouseenter', () => {
    document.querySelector('.resume-preview-3d').style.animationPlayState = 'paused'
})
document.querySelector('.resume-button').addEventListener('mouseleave', () => {
    document.querySelector('.resume-preview-3d').style.animationPlayState = 'running'
})

render()
