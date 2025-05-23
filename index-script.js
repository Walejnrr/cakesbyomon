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
    // --- Initial Display Setup (ensure the first image shows smoothly) ---
    jumbotronImage.style.opacity = 0; // Start hidden
    jumbotronImage.src = imagesWithCacheBuster(images, currentIndex);
    jumbotronImage.onload = () => {
        jumbotronImage.style.opacity = 1; // Fade in the first image
        jumbotronImage.onload = null; // Clear this specific onload handler
    };
    jumbotronImage.onerror = () => {
        console.error('Failed to load initial jumbotron image:', jumbotronImage.src);
        jumbotronImage.style.opacity = 1; // Show blank if error
        jumbotronImage.onerror = null;
    };


    // --- Main Slideshow Logic ---
    function changeImage() {
        // 1. Calculate the index and URL of the *next* image to be displayed
        const nextIndex = (currentIndex + 1) % images.length;
        const nextImageUrl = imagesWithCacheBuster(images, nextIndex);

        // 2. Create a temporary Image object to pre-load the next image in the background
        const tempImage = new Image();

        // 3. Set the onload handler for the TEMPORARY image
        // This code block runs ONLY AFTER the 'nextImageUrl' has completely downloaded
        tempImage.onload = () => {
            // console.log('Next image preloaded successfully:', nextImageUrl); // For debugging

            // 4. Now that the next image is ready, start fading out the *current* jumbotron image
            jumbotronImage.style.opacity = 0; // Initiates the CSS fade-out transition

            // 5. After the fade-out transition completes (500ms timeout),
            //    swap the source and fade in the *already loaded* new image
            setTimeout(() => {
                jumbotronImage.src = nextImageUrl; // Update the actual jumbotron's source
                jumbotronImage.style.opacity = 1; // Fade in the new image

                // Update the current index for the *next* slideshow cycle
                currentIndex = nextIndex;

                // Clean up the temporary image's handlers to prevent memory leaks or unexpected behavior
                tempImage.onload = null;
                tempImage.onerror = null;
            }, 500); // This 500ms should match your CSS transition duration for opacity
        };

        // 6. Set the onerror handler for the TEMPORARY image (fallback if preloading fails)
        tempImage.onerror = () => {
            console.error('Failed to preload image (will attempt direct load):', nextImageUrl);
            // Even if preload fails, still try to proceed with the transition
            jumbotronImage.style.opacity = 0;
            setTimeout(() => {
                jumbotronImage.src = nextImageUrl; // Attempt to load directly (might still be blank if persistent error)
                jumbotronImage.style.opacity = 1;
                currentIndex = nextIndex;
                tempImage.onload = null;
                tempImage.onerror = null;
            }, 500);
        };

        // 7. Trigger the loading of the next image immediately
        tempImage.src = nextImageUrl;
    }

    // --- Start the slideshow interval ---
    // The 4000ms (4 seconds) represents the total duration for one slide cycle.
    // This includes the time the image is fully visible and the fade-in/fade-out times.
    setInterval(changeImage, 4000);
}

});
