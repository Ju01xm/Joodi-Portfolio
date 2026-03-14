const FIREBASE_URL = 'https://joodisite-default-rtdb.firebaseio.com';
let currentLang = localStorage.getItem('joodi_lang') || 'ar';
let allPosts = [];

const dict = {
    en: {
        back: "&larr; Back to Home", lang: "عربي", label: "Creative Newsletter",
        title: "Ideas Lab &<br>Creative Content", desc: "My personal space to share ideas, storytelling, and content writing experiences.",
        articles: "Articles", readMore: "Read Article &rarr;", close: "✕ Close Article",
        authorRole: "Creative Content Writer"
    },
    ar: {
        back: "العودة للرئيسية &rarr;", lang: "EN", label: "النشرة الإبداعية",
        title: "معمل الأفكار<br>والمحتوى الإبداعي", desc: "مساحتي الخاصة لمشاركة الأفكار، السرد القصصي، وتجاربي في كتابة المحتوى.",
        articles: "مقال", readMore: "&larr; اقرأ المقال", close: "✕ إغلاق المقال",
        authorRole: "كاتبة محتوى إبداعي"
    }
};

async function fetchBlogPosts() {
    try {
        const res = await fetch(`${FIREBASE_URL}/blog.json`);
        const data = await res.json();
        if (data) {
            allPosts = Object.values(data).reverse();
            document.getElementById('postCount').innerText = allPosts.length;
            renderPosts();
        } else {
            document.getElementById('postsGrid').innerHTML = `<p style="text-align:center; width:100%;">لا توجد مقالات حالياً.</p>`;
        }
    } catch (e) {
        console.error("Error fetching blog:", e);
    }
}

function renderPosts() {
    const grid = document.getElementById('postsGrid');
    grid.innerHTML = '';
    const langDict = dict[currentLang];

    allPosts.forEach((post, index) => {
        const title = currentLang === 'en' ? (post.titleEn || post.titleAr) : (post.titleAr || post.titleEn);
        let desc = currentLang === 'en' ? (post.descEn || post.descAr) : (post.descAr || post.descEn);

        let cleanExcerpt = desc.replace(/[#*>-]/g, '').replace(/!\[.*?\]\(.*?\)/g, '').substring(0, 120) + '...';

        // استدعاء اللون من قاعدة البيانات أو وضع لون افتراضي
        const postColor = post.color || '#0077b6';

        let coverImage = '';
        if (post.image && Array.isArray(post.image) && post.image.length > 0) {
            coverImage = `<img src="${post.image[0]}" class="card-img-top" alt="Cover">`;
        } else {
            coverImage = `<div class="card-img-top" style="display:flex; align-items:center; justify-content:center; font-size:3rem; background:var(--surface);">📝</div>`;
        }

        const card = document.createElement('div');
        card.className = 'post-card';
        card.onclick = () => openArticle(index);
        card.innerHTML = `
            <div style="height: 6px; background: ${postColor}; width: 100%;"></div>
            ${coverImage}
            <div class="card-body">
                <span class="card-tag" style="background-color: ${postColor}; color: #fff; border: none;">معمل الأفكار</span>
                <h2 class="card-title">${title}</h2>
                <p class="card-excerpt">${cleanExcerpt}</p>
            </div>
            <div class="card-footer" style="color: ${postColor};">${langDict.readMore}</div>
        `;
        grid.appendChild(card);
    });
}

function parseMarkdown(text) {
    if (!text) return '';
    let html = '';
    const lines = text.split('\n');
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        if (line.startsWith('## ')) { if (inList) { html += '</ul>'; inList = false; } html += `<h2 style="color:var(--bg-black); margin: 30px 0 15px; font-size: 1.6rem;">${line.slice(3)}</h2>`; continue; }
        if (line.startsWith('### ')) { if (inList) { html += '</ul>'; inList = false; } html += `<h3 style="color:var(--accent-blue); margin: 20px 0 10px; font-size: 1.3rem;">${line.slice(4)}</h3>`; continue; }
        if (line === '---') { if (inList) { html += '</ul>'; inList = false; } html += '<hr style="border:none; border-top:2px dashed #e8e8e8; margin: 2.5rem 0;">'; continue; }
        if (line.startsWith('- ') || line.startsWith('• ')) { if (!inList) { html += '<ul style="padding-inline-start: 25px; margin-bottom: 15px; line-height: 1.9;">'; inList = true; } html += `<li style="margin-bottom: 8px;">${formatInline(line.slice(2))}</li>`; continue; }
        if (line === '') { if (inList) { html += '</ul>'; inList = false; } continue; }

        if (inList) { html += '</ul>'; inList = false; }
        html += `<p style="margin-bottom: 18px; line-height: 2;">${formatInline(line)}</p>`;
    }
    if (inList) html += '</ul>';
    return html;
}

function formatInline(text) {
    return text.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--bg-black);">$1</strong>')
        .replace(/!\[([^\]]*)\]\((.*?)\)/g, (match, alt, src) => `<img src="${src}" alt="${alt || 'صورة'}" style="max-width:100%; height:auto; border-radius:16px; margin: 2rem 0; box-shadow: 0 10px 30px rgba(0,0,0,0.08); display: block;">`);
}

function openArticle(index) {
    const post = allPosts[index];
    const title = currentLang === 'en' ? (post.titleEn || post.titleAr) : (post.titleAr || post.titleEn);
    const descRaw = currentLang === 'en' ? (post.descEn || post.descAr) : (post.descAr || post.descEn);
    const formattedDesc = parseMarkdown(descRaw);
    const langDict = dict[currentLang];
    
    // جلب بياناتك من "الملف الشخصي" (الاسم والوصف)
    // ملاحظة: تأكدي أن بيانات بروفايلك محملة في الموقع
    const authorName = currentLang === 'en' ? 'Joodi Alamrah' : 'جودي آل عمره';
    const authorRole = currentLang === 'en' ? (window.profileData?.titleAboutEn || 'Creative Content Writer') : (window.profileData?.titleAboutAr || 'كاتبة محتوى إبداعي');
    const authorImg = window.profileData?.logo || 'image/Joodis_logo-removebg-preview.png';

    const postColor = post.color || '#0077b6';

    document.getElementById('articleContent').innerHTML = `
        <span class="article-tag" style="background-color: ${postColor}; color: #fff; border: none;">معمل الأفكار</span>
        <h1 class="article-title">${title}</h1>
        <div class="article-content">
            ${formattedDesc}
        </div>
        
        <div class="article-author" style="margin-top: 4rem; padding: 2rem; background: #fff; border-radius: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 1.5rem;">
            <div style="background: white; padding: 5px; border-radius: 50%; box-shadow: 0 2px 10px rgba(0,0,0,0.1); width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
                <img src="${authorImg}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%;">
            </div>
            <div class="author-details">
                <h4 style="margin:0; color: #003049; font-size: 1.2rem;">${authorName}</h4>
                <p style="margin: 5px 0 0; color: #666; font-size: 0.9rem;">${authorRole}</p>
            </div>
        </div>
    `;
    
    document.getElementById('postViewModal').classList.add('active');
    document.body.style.overflow = 'hidden'; 
}

function closeArticle() {
    document.getElementById('postViewModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function applyBlogLang() {
    const html = document.getElementById('html-root-blog');
    html.setAttribute('lang', currentLang);
    html.setAttribute('dir', currentLang === 'en' ? 'ltr' : 'rtl');

    const d = dict[currentLang];
    document.getElementById('blogBack').innerHTML = d.back;
    document.getElementById('langToggle').innerHTML = d.lang;
    document.getElementById('heroLabel').innerHTML = d.label;
    document.getElementById('heroTitle').innerHTML = d.title;
    document.getElementById('heroDesc').innerHTML = d.desc;
    document.getElementById('statArticles').innerHTML = d.articles;
    document.querySelector('.close-post-view').innerHTML = d.close;

    renderPosts();
}

function toggleBlogLang() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('joodi_lang', currentLang);
    applyBlogLang();
}

document.addEventListener('DOMContentLoaded', () => {
    applyBlogLang();
    fetchBlogPosts();
});