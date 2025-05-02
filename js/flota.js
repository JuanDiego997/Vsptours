const track = document.querySelector('.carousel-track');
const items = document.querySelectorAll('.carousel-item');
const dotsContainer = document.querySelector('.carousel-dots');
const prevBtn = document.querySelector('.carousel-prev');
const nextBtn = document.querySelector('.carousel-next');

let currentIndex = 0;
const itemCount = items.length;

function createDots() {
  for (let i = 0; i < itemCount; i++) {
    const dot = document.createElement('div');
    dot.classList.add('carousel-dot');
    if (i === currentIndex) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }
}

function goToSlide(index) {
  currentIndex = (index + itemCount) % itemCount;
  updateCarousel();
}

function updateCarousel() {
  track.style.transform = `translateX(-${currentIndex * 100}%)`;

  document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
    dot.classList.toggle('active', index === currentIndex);
  });
}

prevBtn.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + itemCount) % itemCount;
  updateCarousel();
});

nextBtn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % itemCount;
  updateCarousel();
});

let slideInterval = setInterval(() => {
  currentIndex = (currentIndex + 1) % itemCount;
  updateCarousel();
}, 5000);

track.addEventListener('mouseenter', () => {
  clearInterval(slideInterval);
});

track.addEventListener('mouseleave', () => {
  slideInterval = setInterval(() => {
    currentIndex = (currentIndex + 1) % itemCount;
    updateCarousel();
  }, 5000);
});

createDots();

const galleryItems = document.querySelectorAll('.gallery-item');

galleryItems.forEach((item) => {
  item.addEventListener('mouseenter', function () {
    const overlay = this.querySelector('.gallery-overlay');
    overlay.style.opacity = '1';
  });

  item.addEventListener('mouseleave', function () {
    const overlay = this.querySelector('.gallery-overlay');
    overlay.style.opacity = '0';
  });
});
