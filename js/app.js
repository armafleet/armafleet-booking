// Stripe Payment Links
const PAYMENT_LINKS = {
    sedan: 'https://buy.stripe.com/test_4gM4gs1fp4cr0NU7SG0co00',
    suv: 'https://buy.stripe.com/test_7sY4gscY724jdAG3Cq0co01',
    premium: 'https://buy.stripe.com/test_fZu8wIbU38sHgMS6OC0co02'
};

// Deposit Amounts
const DEPOSITS = {
    sedan: '$35',
    suv: '$50',
    premium: '$70'
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('bookingForm');
    form.addEventListener('submit', handleFormSubmit);

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.querySelector('input[name="pickupDate"]').setAttribute('min', today);
});

// Smooth Scroll Function
function smoothScroll(id) {
    const element = document.getElementById(id);
    element.scrollIntoView({ behavior: 'smooth' });
}

// Update Price Display
function updatePrice() {
    const vehicleType = document.querySelector('select[name="vehicleType"]').value;
    const depositAmount = document.getElementById('depositAmount');

    if (vehicleType) {
        depositAmount.textContent = DEPOSITS[vehicleType];
    } else {
        depositAmount.textContent = 'Select Vehicle';
    }
}

// Form Submission
async function handleFormSubmit(e) {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
        return;
    }

    // Get vehicle type
    const vehicleType = document.querySelector('select[name="vehicleType"]').value;
    const paymentLink = PAYMENT_LINKS[vehicleType];

    // Gather form data
    const formData = {
        email: document.querySelector('input[name="email"]').value,
        fullName: document.querySelector('input[name="fullName"]').value,
        phone: document.querySelector('input[name="phone"]').value,
        passengers: document.querySelector('input[name="passengers"]').value,
        pickup: document.querySelector('input[name="pickup"]').value,
        dropoff: document.querySelector('input[name="dropoff"]').value,
        pickupDate: document.querySelector('input[name="pickupDate"]').value,
        pickupTime: document.querySelector('input[name="pickupTime"]').value,
        serviceType: document.querySelector('select[name="serviceType"]').value,
        vehicleType: vehicleType,
        specialRequests: document.querySelector('textarea[name="specialRequests"]').value,
        hearAbout: document.querySelector('input[name="hearAbout"]').value,
        timestamp: new Date().toISOString()
    };

    // Save to Google Sheets via Web App Deploy
    try {
        // Show loading modal
        showLoadingModal();

        // Send to Google Sheets
        await fetch('https://script.google.com/macros/d/YOUR-GOOGLE-APPS-SCRIPT-ID/usercontent', {
            method: 'POST',
            body: JSON.stringify(formData),
            mode: 'no-cors'
        });

        // Redirect to payment after 2 seconds
        setTimeout(() => {
            window.location.href = paymentLink;
        }, 2000);
    } catch (error) {
        console.error('Error:', error);
        hideLoadingModal();
        alert('There was an error processing your booking. Please try again.');
    }
}

// Validate Form
function validateForm() {
    const inputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
    let isValid = true;

    inputs.forEach(input => {
        const parent = input.closest('.form-group');
        const error = parent.querySelector('.form-error');

        if (input.hasAttribute('required') && !input.value.trim()) {
            parent.classList.add('error');
            error.textContent = 'This field is required';
            isValid = false;
        } else if (input.type === 'email' && !isValidEmail(input.value)) {
            parent.classList.add('error');
            error.textContent = 'Please enter a valid email';
            isValid = false;
        } else if (input.name === 'phone' && !isValidPhone(input.value)) {
            parent.classList.add('error');
            error.textContent = 'Please enter a valid phone number';
            isValid = false;
        } else {
            parent.classList.remove('error');
        }
    });

    // Check agreement checkbox
    const agreeTerms = document.getElementById('agreeTerms');
    if (!agreeTerms.checked) {
        alert('Please agree to the terms and conditions');
        isValid = false;
    }

    return isValid;
}

// Email Validation
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Phone Validation
function isValidPhone(phone) {
    return phone.replace(/\D/g, '').length >= 10;
}

// Loading Modal
function showLoadingModal() {
    document.getElementById('loadingModal').classList.remove('hidden');
}

function hideLoadingModal() {
    document.getElementById('loadingModal').classList.add('hidden');
}

// Active Nav Link on Scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === currentSection) {
            link.classList.add('active');
        }
    });
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.fleet-card, .contact-card, .feature-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});
