import cake1 from './images/cake1.jpg';
import cake2 from './images/cake2.jpg';
import cake3 from './images/cake3.jpg';
import cake4 from './images/cake4.jpg';
import cake5 from './images/cake5.jpg';
    
document.addEventListener("DOMContentLoaded", function() {
  // --- Mobile Menu Toggle ---
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
    // Close mobile menu when a link is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });
  }

  // --- Dark Mode Toggle ---
  const themeToggleDesktop = document.getElementById('theme-toggle-desktop');
  const themeToggleMobile = document.getElementById('theme-toggle-mobile');
  const htmlElement = document.documentElement; // This is the <html> tag

  // Check local storage for theme preference on load
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    htmlElement.classList.add('dark');
  } else {
    htmlElement.classList.remove('dark');
  }

  function toggleDarkMode() {
    if (htmlElement.classList.contains('dark')) {
      htmlElement.classList.remove('dark');
      localStorage.theme = 'light';
    } else {
      htmlElement.classList.add('dark');
      localStorage.theme = 'dark';
    }
  }

  // Attach event listeners if buttons exist
  if (themeToggleDesktop) {
    themeToggleDesktop.addEventListener('click', toggleDarkMode);
  }
  if (themeToggleMobile) {
    themeToggleMobile.addEventListener('click', toggleDarkMode);
  }

  // --- Jumbotron Image Rotation ---
  const images = [
    cake1,
    cake2,
    cake3,
    cake4,
    cake5
  ];
  let currentIndex = 0;
  const jumbotronImage = document.getElementById('jumbotron-image');

  function imagesWithCacheBuster(imageArray, index) {
      if (imageArray && typeof index === 'number' && index >= 0 && index < imageArray.length) {
          return imageArray[index] + '?' + Date.now();
      }
      return '';
  }

  if (jumbotronImage) { // Only run if the jumbotron image exists
    // Set the initial image source (this will make the first image load and then fade in)
    // Or keep your existing src="images/cake1.jpg" in HTML and let JS handle subsequent changes
    // Let's ensure the first image fades in correctly too
    jumbotronImage.style.opacity = 0; // Start invisible
    jumbotronImage.src = imagesWithCacheBuster(images, currentIndex); // Set first image
    jumbotronImage.onload = () => { // Fade in once first image is loaded
      jumbotronImage.style.opacity = 1;
      jumbotronImage.onload = null; // Clear the onload for initial load
    };
  
  
    function changeImage() {
      jumbotronImage.style.opacity = 0; // Start fade out
  
      // Wait for the fade-out to complete (500ms)
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % images.length;
        const nextImageUrl = imagesWithCacheBuster(images, currentIndex);
  
        // Set the src, and wait for the image to load before fading in
        jumbotronImage.onload = () => {
          jumbotronImage.style.opacity = 1; // Fade in once the *new* image is fully loaded
          jumbotronImage.onload = null; // Important: Clear the onload handler to prevent multiple calls
        };
        jumbotronImage.onerror = () => {
          console.error('Failed to load image:', nextImageUrl);
          jumbotronImage.style.opacity = 1; // If error, still fade in blank or previous image
          jumbotronImage.onerror = null; // Clear the onerror handler
        };
        jumbotronImage.src = nextImageUrl; // This triggers the image loading
      }, 500); // Wait for fade out
    }
  
    setInterval(changeImage, 8000); // Change image every 4 seconds
  }

});
