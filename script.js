window.moveSlide = function(button, direction) {
    const container = button.closest('.slider-container');
    const slides = container.querySelectorAll('.slide');
    if (slides.length <= 1) return;
    let currentIndex = Array.from(slides).findIndex(s => s.classList.contains('active'));
    if (currentIndex === -1) currentIndex = 0;
    slides[currentIndex].classList.remove('active');
    let nextIndex = (currentIndex + direction + slides.length) % slides.length;
    slides[nextIndex].classList.add('active');
};

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.exp-card, .cert-item');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease';
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150);
    });
});

// آلة الكتابة الجديدة (سطر تحت سطر بدون مسح)
let typeTimer;
let lineIndex = 0;
let charIndex = 0;

function getPhrases() {
    const lang = localStorage.getItem('joodi_lang') || 'ar';
    return lang === 'en' ? [
        "Joodi Alamrah",
        "Creative Content Writer",
        "Medical Student"
    ] : [
        "جودي آل عمره",
        "كاتبة محتوى إبداعي",
    ];
}

window.startTypewriter = function() {
    const textElement = document.getElementById('typewriter');
    if(!textElement) return;
    textElement.innerHTML = ''; 
    lineIndex = 0;
    charIndex = 0;
    clearTimeout(typeTimer);
    typeMultiLine();
};

function typeMultiLine() {
    const textElement = document.getElementById('typewriter');
    const phrases = getPhrases();
    
    if (lineIndex < phrases.length) {
        if (charIndex < phrases[lineIndex].length) {
            textElement.innerHTML += phrases[lineIndex].charAt(charIndex);
            charIndex++;
            typeTimer = setTimeout(typeMultiLine, 100);
        } else {
            // إضافة سطر جديد بعد اكتمال الجملة
            if(lineIndex < phrases.length - 1) {
                textElement.innerHTML += '<br><span style="color: var(--accent-gold); font-size: 0.8em;">';
            }
            lineIndex++;
            charIndex = 0;
            typeTimer = setTimeout(typeMultiLine, 500);
        }
    }
}

document.addEventListener('DOMContentLoaded', startTypewriter);