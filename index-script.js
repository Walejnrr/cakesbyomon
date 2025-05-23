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

  if (jumbotronImage && images.length > 0) {
    // --- Initial Display Setup (no change here) ---
    jumbotronImage.style.opacity = 0;
    jumbotronImage.src = imagesWithCacheBuster(images, currentIndex);
    jumbotronImage.onload = () => {
        jumbotronImage.style.opacity = 1;
        jumbotronImage.onload = null;
    };
    jumbotronImage.onerror = () => {
        console.error('Failed to load initial jumbotron image:', jumbotronImage.src);
        jumbotronImage.style.opacity = 1;
        jumbotronImage.onerror = null;
    };


    // --- Main Slideshow Logic ---
    function changeImage() {
        const nextIndex = (currentIndex + 1) % images.length;
        const nextImageUrl = imagesWithCacheBuster(images, nextIndex);

        const tempImage = new Image();

        // This block executes ONLY AFTER the 'nextImageUrl' has completely downloaded
        tempImage.onload = () => {
            // console.log('Next image preloaded successfully:', nextImageUrl); // For debugging

            // 1. Immediately start fading out the CURRENT jumbotron image.
            jumbotronImage.style.opacity = 0; // Initiates the CSS fade-out transition

            // 2. Apply a very short delay (e.g., 50ms) to allow the browser
            //    to register the opacity change before the src swap and fade-in starts.
            //    This minimizes the "blank" perceived time.
            setTimeout(() => {
                jumbotronImage.src = nextImageUrl; // Update the actual jumbotron's source
                jumbotronImage.style.opacity = 1; // Fade in the new image

                currentIndex = nextIndex; // Update the current index for the next cycle

                // Clean up handlers
                tempImage.onload = null;
                tempImage.onerror = null;
            }, 50); // *** Reduced delay from 500ms to 50ms ***
        };

        // Error handling for preloading (no change here)
        tempImage.onerror = () => {
            console.error('Failed to preload image (will attempt direct load):', nextImageUrl);
            jumbotronImage.style.opacity = 0;
            setTimeout(() => {
                jumbotronImage.src = nextImageUrl;
                jumbotronImage.style.opacity = 1;
                currentIndex = nextIndex;
                tempImage.onload = null;
                tempImage.onerror = null;
            }, 50); // Still use the reduced delay
        };

        // Trigger the loading of the next image immediately
        tempImage.src = nextImageUrl;
    }

    // Start the slideshow interval
    setInterval(changeImage, 5500);
}

});
