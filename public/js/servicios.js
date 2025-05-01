const carousels = document.querySelectorAll('.service-image-carousel');

carousels.forEach((carousel) => {
  const slides = carousel.querySelectorAll('.slide');
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  let currentSlide = 0;

  slides[currentSlide].classList.add('active');

  function showSlide(index) {
    slides.forEach((slide) => slide.classList.remove('active'));
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
  }

  nextBtn.addEventListener('click', () => {
    showSlide(currentSlide + 1);
  });

  prevBtn.addEventListener('click', () => {
    showSlide(currentSlide - 1);
  });

  let slideInterval = setInterval(() => {
    showSlide(currentSlide + 1);
  }, 5000);

  carousel.addEventListener('mouseenter', () => {
    clearInterval(slideInterval);
  });

  carousel.addEventListener('mouseleave', () => {
    slideInterval = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 5000);
  });
});

const infoButtons = document.querySelectorAll('.more-info-btn');

infoButtons.forEach((button) => {
  button.addEventListener('mouseenter', () => {
    const icon = button.querySelector('i');
    icon.style.transform = 'translateX(3px)';
  });

  button.addEventListener('mouseleave', () => {
    const icon = button.querySelector('i');
    icon.style.transform = 'translateX(0)';
  });
});
