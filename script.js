// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const navbar = document.querySelector('.navbar');

// Mobile Navigation Toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on nav links
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.service-card, .gallery-item, .contact-content');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Quote Generator functionality
const quoteForm = {
    serviceType: document.getElementById('service-type'),
    carSize: document.getElementById('car-size'),
    carCondition: document.getElementById('car-condition'),
    quotePrice: document.getElementById('quote-price'),
    quoteActions: document.getElementById('quote-actions'),
    whatsappBtn: document.querySelector('.quote-whatsapp-btn')
};

// Base prices
const basePrices = {
    exterior: 15,
    full: 35
};

// Calculate quote
function calculateQuote() {
    const serviceType = quoteForm.serviceType.value;
    const carSize = quoteForm.carSize.value;
    const carCondition = quoteForm.carCondition.value;

    // Check if all fields are selected
    if (!serviceType || !carSize || !carCondition) {
        quoteForm.quotePrice.textContent = 'Select options above';
        quoteForm.quoteActions.style.display = 'none';
        return;
    }

    // Calculate price - only base price, +£5, or -£5
    const basePrice = basePrices[serviceType];
    let totalPrice = basePrice;

    // Only apply -£5 for small + clean combination
    if (carSize === 'small' && carCondition === 'clean') {
        totalPrice = basePrice - 5;
    }
    // Only apply +£5 for large + dirty combination
    else if (carSize === 'large' && carCondition === 'dirty') {
        totalPrice = basePrice + 5;
    }
    // All other combinations stay at base price

    // Update display
    quoteForm.quotePrice.textContent = `£${totalPrice}`;
    quoteForm.quoteActions.style.display = 'block';

    // Update WhatsApp link
    const serviceName = serviceType === 'exterior' ? 'Exterior Wash' : 'Full Valet';
    const sizeName = carSize.charAt(0).toUpperCase() + carSize.slice(1);
    const conditionName = carCondition.charAt(0).toUpperCase() + carCondition.slice(1);
    
    const message = encodeURIComponent(
        `Hi! I'd like to book a ${serviceName} for my ${sizeName} car (${conditionName} condition). ` +
        `The quote generator estimated £${totalPrice}. Can we arrange a booking?`
    );
    
    quoteForm.whatsappBtn.href = `https://wa.me/447368865411?text=${message}`;
}

// Add event listeners to form elements
if (quoteForm.serviceType) {
    quoteForm.serviceType.addEventListener('change', calculateQuote);
    quoteForm.carSize.addEventListener('change', calculateQuote);
    quoteForm.carCondition.addEventListener('change', calculateQuote);
}

// Gallery slider functionality
let currentSlide = 0;
const sliderTrack = document.querySelector('.slider-track');
const galleryItems = document.querySelectorAll('.gallery-item');
const totalSlides = galleryItems.length;
const prevBtn = document.querySelector('.slider-btn-prev');
const nextBtn = document.querySelector('.slider-btn-next');
const dotsContainer = document.querySelector('.slider-dots');

// Calculate slides per view based on screen size
function getSlidesPerView() {
    if (window.innerWidth <= 480) return 1;
    if (window.innerWidth <= 768) return 2;
    return 4;
}

let slidesPerView = getSlidesPerView();
const totalSlideGroups = Math.ceil(totalSlides / slidesPerView);

// Create dots
function createDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalSlideGroups; i++) {
        const dot = document.createElement('div');
        dot.classList.add('slider-dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
}

// Update slider position
function updateSlider() {
    const slideWidth = 100 / slidesPerView;
    const translateX = -currentSlide * slideWidth * slidesPerView;
    sliderTrack.style.transform = `translateX(${translateX}%)`;
    
    // Update dots
    document.querySelectorAll('.slider-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

// Go to specific slide
function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateSlider();
}

// Next slide
function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlideGroups;
    updateSlider();
}

// Previous slide
function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlideGroups) % totalSlideGroups;
    updateSlider();
}

// Event listeners
if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);
}

// Initialize slider
if (sliderTrack) {
    createDots();
    updateSlider();
}

// Handle window resize
window.addEventListener('resize', () => {
    const newSlidesPerView = getSlidesPerView();
    if (newSlidesPerView !== slidesPerView) {
        slidesPerView = newSlidesPerView;
        currentSlide = 0;
        createDots();
        updateSlider();
    }
});

// Auto-play slider (optional)
let autoPlay = setInterval(nextSlide, 5000);

// Pause auto-play on hover
const gallerySlider = document.querySelector('.gallery-slider');
if (gallerySlider) {
    gallerySlider.addEventListener('mouseenter', () => {
        clearInterval(autoPlay);
    });
    
    gallerySlider.addEventListener('mouseleave', () => {
        autoPlay = setInterval(nextSlide, 5000);
    });
}

// Gallery lightbox effect
galleryItems.forEach(item => {
    const img = item.querySelector('img');
    if (img) {
        img.addEventListener('click', () => {
            createLightbox(img.src, img.alt);
        });
    }
});

function createLightbox(src, alt) {
    // Create lightbox overlay
    const lightbox = document.createElement('div');
    lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        cursor: pointer;
    `;

    // Create image element
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 10px;
    `;

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 30px;
        background: none;
        border: none;
        color: white;
        font-size: 3rem;
        cursor: pointer;
        z-index: 10001;
    `;

    lightbox.appendChild(img);
    lightbox.appendChild(closeBtn);
    document.body.appendChild(lightbox);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Close lightbox events
    const closeLightbox = () => {
        document.body.removeChild(lightbox);
        document.body.style.overflow = 'auto';
    };

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    
    closeBtn.addEventListener('click', closeLightbox);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Add loading animation
window.addEventListener('load', () => {
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.opacity = '1';
    }
});

// Service card hover effects
const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-15px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// Animate numbers on scroll (for prices)
const animateNumbers = () => {
    const prices = document.querySelectorAll('.service-price');
    prices.forEach(price => {
        const finalValue = parseInt(price.textContent.replace('£', ''));
        let currentValue = 0;
        const increment = finalValue / 50;
        
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                price.textContent = `£${finalValue}`;
                clearInterval(timer);
            } else {
                price.textContent = `£${Math.floor(currentValue)}`;
            }
        }, 20);
    });
};

// Trigger number animation when services section is in view
const servicesSection = document.querySelector('.services');
if (servicesSection) {
    const servicesObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumbers();
                servicesObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    servicesObserver.observe(servicesSection);
}

// Add CSS class for mobile hamburger animation
const style = document.createElement('style');
style.textContent = `
    .hamburger.active .bar:nth-child(2) {
        opacity: 0;
    }
    .hamburger.active .bar:nth-child(1) {
        transform: translateY(8px) rotate(45deg);
    }
    .hamburger.active .bar:nth-child(3) {
        transform: translateY(-8px) rotate(-45deg);
    }
`;
document.head.appendChild(style); 