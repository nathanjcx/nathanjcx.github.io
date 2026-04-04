const themeToggle = document.getElementById('theme-toggle')
const themes = ['light', 'dark', 'hacker']
let currentThemeIndex = themes.indexOf(localStorage.getItem('theme') || 
                   (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
if (currentThemeIndex === -1) currentThemeIndex = 0

function setTheme(theme) {
    document.body.removeAttribute('data-theme')
    if (theme !== 'light') {
        document.body.setAttribute('data-theme', theme)
    }
    localStorage.setItem('theme', theme)
}

setTheme(themes[currentThemeIndex])
themeToggle.addEventListener('click', () => {
    currentThemeIndex = (currentThemeIndex + 1) % themes.length
    setTheme(themes[currentThemeIndex])
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
    const preview = document.querySelector('.resume-preview-3d')
    if (preview) preview.style.animationPlayState = 'paused'
})
document.querySelector('.resume-button').addEventListener('mouseleave', () => {
    const preview = document.querySelector('.resume-preview-3d')
    if (preview) preview.style.animationPlayState = 'running'
})
