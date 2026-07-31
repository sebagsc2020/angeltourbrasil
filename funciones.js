// ==========================================
// FUNCIONES DE COOKIES (Ligeras y Nativas)
// ==========================================
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function acceptCookies() {
    setCookie('cookie_consent', 'accepted', 365);
    document.getElementById('cookieBanner').classList.remove('active');
}

function declineCookies() {
    setCookie('cookie_consent', 'declined', 365);
    document.getElementById('cookieBanner').classList.remove('active');
}

function checkCookieConsent() {
    const consent = getCookie('cookie_consent');
    if (!consent) {
        setTimeout(() => {
            document.getElementById('cookieBanner').classList.add('active');
        }, 1500);
    }
}

// ==========================================
// FUNCIONES PARA GALERÍA DE FOTOS CON LIGHTBOX MEJORADO
// ==========================================
function createGallery(gridId) {
    const totalImages = 26;
    const baseUrl = "https://www.angeltourbrasil.com.br/images/mp_";
    const extension = ".webp";

    const imageTitles = [
        "Vista aérea del parque", "Piscina de olas", "Tobogán Kamikaze",
        "Área infantil", "Piscina climatizada", "Tobogán familiar",
        "Vista panorámica", "Piscina de relax", "Tobogán extremo",
        "Área VIP", "Piscina infantil", "Tobogán en espiral",
        "Vista nocturna", "Piscina principal", "Tobogán de velocidad",
        "Zona de descanso", "Piscina de olas 2", "Tobogán familiar 2",
        "Área de juegos", "Piscina con vista", "Tobogán acuático",
        "Zona infantil", "Vista del atardecer", "Piscina de inmersión",
        "Tobogán radical", "Vista aérea 2"
    ];

    const grid = document.getElementById(gridId);
    if (!grid) return;

    grid.innerHTML = '';

    const images = [];
    for (let i = 1; i <= totalImages; i++) {
        images.push({
            id: i,
            src: baseUrl + i + extension,
            title: imageTitles[i - 1] || "Multiparque SC",
        });
    }

    for (let i = images.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [images[i], images[j]] = [images[j], images[i]];
    }

    const sizeClasses = ['', 'item-tall', 'item-wide', 'item-large'];
    let validImages = [];

    images.forEach((img, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        const sizeIndex = index % 4;
        if (sizeIndex > 0) {
            item.classList.add(sizeClasses[sizeIndex]);
        }

        const imgElement = document.createElement('img');
        imgElement.src = img.src;
        imgElement.alt = img.title;
        imgElement.loading = 'lazy';

        imgElement.onerror = function() {
            item.classList.add('hidden');
            const imgIndex = validImages.findIndex(v => v.id === img.id);
            if (imgIndex !== -1) {
                validImages.splice(imgIndex, 1);
            }
        };

        imgElement.onload = function() {
            validImages.push(img);
            validImages.forEach((v, idx) => v.lightboxIndex = idx);
        };

        item.appendChild(imgElement);

        item.addEventListener('click', function() {
            const idx = validImages.findIndex(v => v.id === img.id);
            if (idx !== -1) {
                openLightbox(idx, validImages);
            }
        });

        grid.appendChild(item);
    });

    window['galleryImages_' + gridId] = validImages;
    return validImages;
}

let lightboxImages = [];
let lightboxIndex = 0;
let touchStartX = 0;
let touchStartY = 0;
let isSwiping = false;
let clickCount = 0;
let clickTimer = null;

function openLightbox(index, images) {
    if (!images || images.length === 0) return;
    lightboxImages = images;
    lightboxIndex = Math.min(index, images.length - 1);
    
    const overlay = document.getElementById('lightboxOverlay');
    const img = document.getElementById('lightboxImage');
    const counter = document.getElementById('lightboxCounter');
    
    if (img && lightboxImages[lightboxIndex]) {
        img.src = lightboxImages[lightboxIndex].src;
        img.alt = lightboxImages[lightboxIndex].title;
    }
    if (counter && lightboxImages[lightboxIndex]) {
        counter.textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;
    }
    
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    clickCount = 0;
}

function closeLightboxGlobal() {
    const overlay = document.getElementById('lightboxOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function navigateLightbox(direction) {
    if (!lightboxImages || lightboxImages.length === 0) return;
    lightboxIndex = (lightboxIndex + direction + lightboxImages.length) % lightboxImages.length;
    
    const img = document.getElementById('lightboxImage');
    const counter = document.getElementById('lightboxCounter');
    
    if (img && lightboxImages[lightboxIndex]) {
        img.src = lightboxImages[lightboxIndex].src;
        img.alt = lightboxImages[lightboxIndex].title;
    }
    if (counter && lightboxImages[lightboxIndex]) {
        counter.textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;
    }
}

// ==========================================
// EVENTOS DEL LIGHTBOX Y CARGAS INICIALES
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const lightboxImage = document.getElementById('lightboxImage');
    if (lightboxImage) {
        lightboxImage.addEventListener('click', function(e) {
            clickCount++;
            if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;
            }
            if (clickCount === 2) {
                closeLightboxGlobal();
                clickCount = 0;
            } else {
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                    clickTimer = null;
                }, 400);
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeLightboxGlobal();
        }
        if (e.key === 'ArrowLeft' && document.getElementById('lightboxOverlay').classList.contains('active')) {
            navigateLightbox(-1);
        }
        if (e.key === 'ArrowRight' && document.getElementById('lightboxOverlay').classList.contains('active')) {
            navigateLightbox(1);
        }
    });

    document.getElementById('lightboxPrev').addEventListener('click', function(e) {
        e.stopPropagation();
        navigateLightbox(-1);
    });
    document.getElementById('lightboxNext').addEventListener('click', function(e) {
        e.stopPropagation();
        navigateLightbox(1);
    });

    document.getElementById('lightboxClose').addEventListener('click', function(e) {
        e.stopPropagation();
        closeLightboxGlobal();
    });

    document.getElementById('lightboxOverlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeLightboxGlobal();
        }
    });

    const container = document.getElementById('lightboxContainer');
    container.addEventListener('touchstart', function(e) {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        isSwiping = false;
    }, { passive: true });

    container.addEventListener('touchmove', function(e) {
        if (!touchStartX || !touchStartY) return;
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
            isSwiping = true;
            e.preventDefault();
        }
    }, { passive: false });

    container.addEventListener('touchend', function(e) {
        if (!touchStartX || !isSwiping) {
            touchStartX = 0;
            touchStartY = 0;
            isSwiping = false;
            return;
        }
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        if (Math.abs(deltaX) > 50) {
            if (deltaX < 0) {
                navigateLightbox(1);
            } else {
                navigateLightbox(-1);
            }
        }
        touchStartX = 0;
        touchStartY = 0;
        isSwiping = false;
    }, { passive: true });

    createGallery('galleryGrid');
    createGallery('galleryGridEn');
    createGallery('galleryGridPt');

    if (window.innerWidth <= 768) {
        document.getElementById('langSwitcher').classList.add('hidden');
        setTimeout(() => {
            document.getElementById('langToggle').classList.add('visible');
        }, 100);
    }
    updateWATooltip('es');
    checkCookieConsent();
});

// ==========================================
// FUNCIONES PARA FAQ
// ==========================================
let activeFAQ = null;

function toggleFAQ(element) {
    const faqItem = element.closest('.faq-item');
    const isActive = faqItem.classList.contains('active');
    if (activeFAQ && activeFAQ !== faqItem) {
        activeFAQ.classList.remove('active');
    }
    if (isActive) {
        faqItem.classList.remove('active');
        activeFAQ = null;
    } else {
        faqItem.classList.add('active');
        activeFAQ = faqItem;
    }
}

// ==========================================
// FUNCIONES DE IDIOMA Y MODALES
// ==========================================
const waTooltips = {
    es: '💬 Contáctanos por WhatsApp',
    en: '💬 Contact us on WhatsApp',
    pt: '💬 Fale conosco pelo WhatsApp'
};

function updateWATooltip(lang) {
    const tooltip = document.getElementById('waTooltip');
    if (tooltip && waTooltips[lang]) {
        tooltip.textContent = waTooltips[lang];
    }
}

function openMapsNavigation() {
    const lat = -27.055213048331684;
    const lng = -48.596279232125426;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving&dir_action=navigate`;
    window.open(url, '_blank');
}

function openModal(type, lang) {
    const modal = document.getElementById(type === 'terms' ? 'modalTerms' : 'modalPrivacy');
    if (modal) {
        const langContents = modal.querySelectorAll('.modal-lang-content');
        langContents.forEach(el => el.classList.remove('active-lang'));
        const target = document.getElementById('modal-' + type + '-' + lang);
        if (target) {
            target.classList.add('active-lang');
        }
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(type) {
    const modal = document.getElementById(type === 'terms' ? 'modalTerms' : 'modalPrivacy');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
        closeLightboxGlobal();
    }
});

function setLang(lang) {
    document.querySelectorAll('.lang-content').forEach(el => el.classList.remove('active-lang'));
    document.getElementById('lang-' + lang).classList.add('active-lang');
    
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        const langContents = modal.querySelectorAll('.modal-lang-content');
        langContents.forEach(el => el.classList.remove('active-lang'));
        const target = modal.querySelector('.modal-lang-content[data-lang="' + lang + '"]');
        if (target) {
            target.classList.add('active-lang');
        }
    });
    
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if(btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${lang}'`)) {
            btn.classList.add('active');
        }
    });
    updateWATooltip(lang);
    if (activeFAQ) {
        activeFAQ.classList.remove('active');
        activeFAQ = null;
    }
    toggleLangSwitcher(true);
}

function toggleLangSwitcher(forceHide = false) {
    const switcher = document.getElementById('langSwitcher');
    const toggle = document.getElementById('langToggle');
    if (forceHide || !switcher.classList.contains('hidden')) {
        switcher.classList.add('hidden');
        setTimeout(() => {
            toggle.classList.add('visible');
        }, 400);
    } else {
        switcher.classList.remove('hidden');
        toggle.classList.remove('visible');
    }
}

// ==========================================
// MANEJO DEL FORMULARIO
// ==========================================
function handleFormSubmit(event) {
    event.preventDefault();
    let formId = event.target.id;
    let prefix = '';
    if(formId === 'contactForm') prefix = '';
    else if(formId === 'contactFormEn') prefix = '_en';
    else if(formId === 'contactFormPt') prefix = '_pt';

    const nombre = document.getElementById('nombre' + prefix).value;
    const email = document.getElementById('email' + prefix).value;
    const telefono = document.getElementById('telefono' + prefix).value;
    const empresa = document.getElementById('empresa' + prefix).value;
    const fecha_reserva = document.getElementById('fecha_reserva' + prefix).value;
    const cantidad = document.getElementById('cantidad' + prefix).value;
    const mensaje = document.getElementById('mensaje' + prefix).value;

    let message = `📢 *NUEVA RESERVA - MULTIPARQUE SC* 📢%0A%0A` +
                    `👤 *Nombre:* ${nombre}%0A` +
                    `📧 *E-mail:* ${email}%0A` +
                    `📞 *Teléfono:* ${telefono}%0A` +
                    `🏢 *Empresa:* ${empresa}%0A`;
    if (fecha_reserva) message += `📅 *Fecha Estimativa:* ${fecha_reserva}%0A`;
    if (cantidad) message += `👥 *Cantidad de personas:* ${cantidad}%0A`;
    message += `📝 *Mensaje:*%0A${mensaje}`;
                            
    const phone = "554799679084";
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
}

document.getElementById('contactForm').addEventListener('submit', handleFormSubmit);
document.getElementById('contactFormEn').addEventListener('submit', handleFormSubmit);
document.getElementById('contactFormPt').addEventListener('submit', handleFormSubmit);

// ==========================================
// SLIDER DE FONDO
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const totalImages = 26;
    const baseUrl = "https://www.angeltourbrasil.com.br/images/mp_";
    const extension = ".webp";
    
    function generateRandomSequence() {
        let numbers = [];
        for(let i = 1; i <= totalImages; i++) numbers.push(i);
        for(let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }
        return numbers;
    }

    let sequence = generateRandomSequence();
    let currentIndex = 0;

    function initSlider(containerId) {
        const container = document.getElementById(containerId);
        if(!container) return;

        let validImages = [];
        let imagesLoaded = 0;

        function onImageLoad(img) {
            imagesLoaded++;
            validImages.push(img);
            if(imagesLoaded === 1) img.classList.add('active');
        }

        function onImageError(img) { img.remove(); }

        container.innerHTML = '';
        for(let i = 1; i <= totalImages; i++) {
            const img = document.createElement('img');
            img.src = baseUrl + i + extension;
            img.alt = "Background " + i;
            img.addEventListener('load', function() { onImageLoad(this); });
            img.addEventListener('error', function() { onImageError(this); });
            container.appendChild(img);
        }

        if (validImages.length === 0) {
            setTimeout(() => {
                if (validImages.length > 0) startSlideshow(container);
            }, 3000);
        } else {
            startSlideshow(container);
        }

        function startSlideshow(container) {
            const activeExists = container.querySelector('img.active');
            if (!activeExists && validImages.length > 0) validImages[0].classList.add('active');

            if (window.sliderIntervals && window.sliderIntervals[containerId]) {
                clearInterval(window.sliderIntervals[containerId]);
            }

            window.sliderIntervals = window.sliderIntervals || {};
            window.sliderIntervals[containerId] = setInterval(function() {
                const nextIndex = sequence[currentIndex % sequence.length];
                const existingImg = Array.from(container.children).find(img => img.src && img.src.includes(`mp_${nextIndex}`));
                if(existingImg && existingImg.classList && validImages.length > 0) {
                    validImages.forEach(img => img.classList.remove('active'));
                    existingImg.classList.add('active');
                }
                currentIndex++;
                if(currentIndex >= sequence.length) {
                    sequence = generateRandomSequence();
                    currentIndex = 0;
                }
            }, 5000);
        }
    }

    initSlider('bgSlider');
    initSlider('bgSliderEn');
    initSlider('bgSliderPt');
});