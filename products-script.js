import { createClient } from '@supabase/supabase-js'; // Import createClient

// These environment variables will be injected by Vite/Netlify
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;


    document.addEventListener("DOMContentLoaded", function() {
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 


        // --- Theme Toggle (Existing) ---
        const themeToggleDesktop = document.getElementById('theme-toggle-desktop');
        const themeToggleMobile = document.getElementById('theme-toggle-mobile');
        const htmlElement = document.documentElement;

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

        if (themeToggleDesktop) {
            themeToggleDesktop.addEventListener('click', toggleDarkMode);
        }
        if (themeToggleMobile) {
            themeToggleMobile.addEventListener('click', toggleDarkMode);
        }

        // --- Mobile Menu Toggle (Existing) ---
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.add('hidden');
                });
            });
        }

        // --- Cart System Logic ---
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalSpan = document.getElementById('cart-total');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const desktopCartCount = document.getElementById('cart-count-desktop');
        const mobileCartCount = document.getElementById('cart-count-mobile');
        const checkoutBtn = document.getElementById('checkout-btn');
        const clearCartBtn = document.getElementById('clear-cart-btn');

        // NEW: Delivery Details Modal Elements
        const deliveryDetailsModalOverlay = document.getElementById('delivery-details-modal-overlay');
        const closeDeliveryModalBtn = document.getElementById('close-delivery-modal-btn');
        const deliveryDetailsForm = document.getElementById('delivery-details-form');
        const customerNameInput = document.getElementById('customer-name');
        const deliveryAddressInput = document.getElementById('delivery-address');
        const phoneNumberInput = document.getElementById('phone-number');

        // NEW: Checkout Method Modal Elements (Existing, just moved for clarity)
        const checkoutModalOverlay = document.getElementById('checkout-modal-overlay');
        const closeCheckoutModalBtn = document.getElementById('close-checkout-modal-btn');
        const checkoutWhatsappBtn = document.getElementById('checkout-whatsapp-btn');
        const checkoutEmailBtn = document.getElementById('checkout-email-btn');

        let cart = []; // Array to hold cart items

        // Function to save cart to localStorage
        function saveCart() {
            localStorage.setItem('shoppingCart', JSON.stringify(cart));
        }

        // Function to load cart from localStorage
        function loadCart() {
            const storedCart = localStorage.getItem('shoppingCart');
            if (storedCart) {
                cart = JSON.parse(storedCart);
            }
        }

        // Function to render cart items in the sidebar
        function renderCart() {
            cartItemsContainer.innerHTML = ''; // Clear current items
            let total = 0;

            if (cart.length === 0) {
                emptyCartMessage.style.display = 'block';
                checkoutBtn.disabled = true;
                checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed'); // Visually disable
                clearCartBtn.disabled = true;
                clearCartBtn.classList.add('opacity-50', 'cursor-not-allowed'); // Visually disable
            } else {
                emptyCartMessage.style.display = 'none';
                checkoutBtn.disabled = false;
                checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed'); // Enable
                clearCartBtn.disabled = false;
                clearCartBtn.classList.remove('opacity-50', 'cursor-not-allowed'); // Enable

                cart.forEach(item => {
                    const itemTotal = item.price * item.quantity;
                    total += itemTotal;

                    const cartItemDiv = document.createElement('div');
                    cartItemDiv.classList.add('flex', 'items-center', 'justify-between', 'py-3', 'border-b', 'border-gray-100', 'dark:border-gray-700');
                    cartItemDiv.innerHTML = `
                        <div>
                            <h4 class="font-semibold text-gray-800 dark:text-gray-200">${item.name}</h4>
                            <p class="text-sm text-gray-600 dark:text-gray-400">₦${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} x ${item.quantity}</p>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button data-id="${item.id}" data-action="decrease" class="cart-qty-btn bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">-</button>
                            <span class="text-gray-800 dark:text-gray-200 font-medium">${item.quantity}</span>
                            <button data-id="${item.id}" data-action="increase" class="cart-qty-btn bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">+</button>
                            <button data-id="${item.id}" data-action="remove" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-2">&times;</button>
                        </div>
                    `;
                    cartItemsContainer.appendChild(cartItemDiv);
                });
            }

            cartTotalSpan.textContent = total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            desktopCartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
            mobileCartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
            saveCart(); // Save cart state after rendering
        }

        // --- NEW: Function to fetch products from Supabase and render them ---
        async function fetchProductsAndRender(category, containerId, loadingId) {
            const container = document.getElementById(containerId);
            const loadingMessage = document.getElementById(loadingId);

            container.innerHTML = ''; // Clear existing content
            loadingMessage.style.display = 'block'; // Show loading message

            try {
                const { data, error } = await supabase
                    .from('products') // Your table name in Supabase
                    .select('*')
                    .eq('category', category)
                    .order('name', { ascending: true });

                if (error) {
                    console.error('Error fetching products from Supabase:', error.message);
                    container.innerHTML = `<p class="col-span-full text-red-500 dark:text-red-400">Failed to load ${category}. Please check console for details.</p>`;
                    return;
                }

                if (data.length === 0) {
                    container.innerHTML = `<p class="col-span-full text-gray-500 dark:text-gray-400">No ${category} available yet. Check back soon!</p>`;
                    return;
                }

                loadingMessage.style.display = 'none'; // Hide loading message if data is loaded

                data.forEach(product => {

                    console.log("Processing product:", product.name);
                    console.log("Product object received:", product);
                    console.log("Image URL from product:", product.image_url);
                    const productCard = document.createElement('div');
                    productCard.classList.add(
                        'bg-white', 'dark:bg-gray-700', 'p-6', 'rounded-lg', 'shadow-md',
                        'hover:shadow-xl', 'transition', 'transform', 'hover:-translate-y-1'
                    );
                    productCard.dataset.productId = product.id;
                    productCard.dataset.productName = product.name;

                    productCard.innerHTML = `
                        <img src="${product.img_url || 'https://placehold.co/400x200/E5E7EB/6B7280?text=No+Image'}" alt="${product.name}" class="w-full h-48 object-cover rounded-md mb-4" loading="lazy">
                        <h3 class="text-xl font-semibold text-rose-700 dark:text-rose-300 mb-2">${product.name}</h3>
                        ${product.description ? `<p class="text-gray-700 dark:text-gray-300 text-sm mb-2">${product.description}</p>` : ''}
                        <p class="text-lg font-bold text-sky-700 dark:text-sky-400 mb-4">Price: ₦<span class="product-price" data-price="${product.price}">${parseFloat(product.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                        <div class="flex items-center justify-center space-x-2 mb-4">
                            <label for="qty-${product.id}" class="sr-only">Quantity</label>
                            <input type="number" id="qty-${product.id}" min="1" value="1" class="item-quantity w-20 p-2 border border-gray-300 dark:border-gray-600 rounded-md text-center bg-gray-50 dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500">
                            <button class="add-to-cart-btn bg-rose-400 dark:bg-rose-500 text-sky-700 px-5 py-2 rounded-full hover:bg-rose-500 dark:hover:bg-rose-600 transition shadow-md">Add to Cart</button>
                        </div>
                    `;
                    container.appendChild(productCard);
                });
            } catch (fetchError) {
                console.error('An unexpected error occurred during product fetching:', fetchError);
                container.innerHTML = `<p class="col-span-full text-red-500 dark:text-red-400">An error occurred while loading products. Please refresh the page.</p>`;
            } finally {
                loadingMessage.style.display = 'none'; // Ensure loading message is hidden
            }
        }

        // --- IMPORTANT: MODIFIED Add to Cart functionality ---
        // This event listener needs to be attached to a parent element
        // that exists when the page first loads, as product cards are added dynamically.
        // The most robust way is to listen on 'document' or the main content area.
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('add-to-cart-btn')) {
                const button = event.target;
                const productCard = button.closest('[data-product-id]');
                const productId = productCard.dataset.productId;
                const productName = productCard.dataset.productName;
                // Get price directly from the data-price attribute of the span
                const productPrice = parseFloat(productCard.querySelector('.product-price').dataset.price);
                const quantityInput = productCard.querySelector('.item-quantity');
                const quantity = parseInt(quantityInput.value);

                if (quantity < 1) {
                    alert('Please enter a quantity of 1 or more.');
                    return;
                }

                const existingItemIndex = cart.findIndex(item => item.id === productId);

                if (existingItemIndex > -1) {
                    cart[existingItemIndex].quantity += quantity;
                } else {
                    cart.push({
                        id: productId,
                        name: productName,
                        price: productPrice,
                        quantity: quantity
                    });
                }
                renderCart();
                cartSidebar.classList.add('open'); // Open cart sidebar when item is added
            }
        });

        // --- Cart sidebar toggle (Existing) ---
        document.getElementById('cart-toggle-desktop').addEventListener('click', () => {
            cartSidebar.classList.toggle('open');
            mobileMenu.classList.add('hidden'); // Close mobile menu if open
        });
        document.getElementById('cart-toggle-mobile').addEventListener('click', () => {
            cartSidebar.classList.toggle('open');
            mobileMenu.classList.add('hidden'); // Close mobile menu if open
        });
        document.getElementById('close-cart-btn').addEventListener('click', () => {
            cartSidebar.classList.remove('open');
        });

        // Handle quantity changes and item removal in cart (Existing)
        cartItemsContainer.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('cart-qty-btn')) {
                const itemId = target.dataset.id;
                const action = target.dataset.action;
                const itemIndex = cart.findIndex(item => item.id === itemId);

                if (itemIndex > -1) {
                    if (action === 'increase') {
                        cart[itemIndex].quantity++;
                    } else if (action === 'decrease') {
                        cart[itemIndex].quantity--;
                        if (cart[itemIndex].quantity <= 0) {
                            cart.splice(itemIndex, 1); // Remove if quantity drops to 0 or less
                        }
                    }
                }
                renderCart();
            } else if (target.dataset.action === 'remove') {
                const itemId = target.dataset.id;
                cart = cart.filter(item => item.id !== itemId);
                renderCart();
            }
        });

        // Clear Cart button (Existing)
        clearCartBtn.addEventListener('click', () => {
            cart = [];
            renderCart();
        });

        // Close delivery details modal (Existing)
        closeDeliveryModalBtn.addEventListener('click', () => {
            deliveryDetailsModalOverlay.classList.remove('open');
            deliveryDetailsForm.reset(); // Clear the form fields
        });

        // Handle submission of delivery details form (Existing)
        deliveryDetailsForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission

            const customerName = customerNameInput.value.trim();
            const deliveryAddress = deliveryAddressInput.value.trim();
            const phoneNumber = phoneNumberInput.value.trim();

            if (customerName === '' || deliveryAddress === '' || phoneNumber === '') {
                alert('Please fill in all delivery details.');
                return;
            }

            const orderDetails = {
                name: customerName,
                address: deliveryAddress,
                phone: phoneNumber
            };
            localStorage.setItem('tempOrderDetails', JSON.stringify(orderDetails)); // Save temporarily

            deliveryDetailsModalOverlay.classList.remove('open'); // Close delivery modal
            checkoutModalOverlay.classList.add('open'); // Open the checkout method modal

            deliveryDetailsForm.reset(); // Clear the form fields after submission
        });

        // Open delivery details modal when 'Proceed to Checkout' is clicked (Existing)
        checkoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                deliveryDetailsModalOverlay.classList.add('open');
                cartSidebar.classList.remove('open'); // Close cart sidebar when modal opens
            } else {
                alert('Your cart is empty. Please add items before proceeding to checkout.');
            }
        });

        // --- NEW: Checkout Functionality (Existing) ---
        const whatsappPhoneNumber = '+2348101507273';
        const ownerEmail = 'omonefrancess30@gmail.com';

        function generateInvoiceMessage(name, address, phone) {
            let message = `Hello Cakes by Omon!%0A%0AI have a new order:%0A%0A`;

            message += `--- Customer Details ---%0A`;
            message += `Name: ${name}%0A`;
            message += `Address: ${address}%0A`;
            message += `Phone: ${phone}%0A%0A`;

            message += `--- Order Details ---%0A`;
            let totalAmount = 0;

            cart.forEach(item => {
                const itemSubtotal = item.price * item.quantity;
                totalAmount += itemSubtotal;
                message += `- ${item.name} x ${item.quantity} = ₦${itemSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%0A`;
            });

            message += `%0ATotal Order Amount: ₦${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%0A%0A`;
            message += `Please confirm availability and delivery. Thank you!`;
            return message;
        }

        // Close checkout modal (Existing)
        closeCheckoutModalBtn.addEventListener('click', () => {
            checkoutModalOverlay.classList.remove('open');
        });

        // Handle WhatsApp checkout (Existing)
        checkoutWhatsappBtn.addEventListener('click', () => {
            const storedDetails = JSON.parse(localStorage.getItem('tempOrderDetails'));
            if (!storedDetails) {
                alert('Delivery details not found. Please re-enter them.');
                checkoutModalOverlay.classList.remove('open');
                deliveryDetailsModalOverlay.classList.add('open'); // Re-open delivery modal
                return;
            }
            const invoiceMessage = generateInvoiceMessage(storedDetails.name, storedDetails.address, storedDetails.phone);
            const whatsappUrl = `https://wa.me/${whatsappPhoneNumber}?text=${invoiceMessage}`;
            window.open(whatsappUrl, '_blank');
            checkoutModalOverlay.classList.remove('open'); // Close modal after action
            localStorage.removeItem('tempOrderDetails'); // Clean up temporary storage
            cart = []; // Clear cart after order initiation
            renderCart();
        });

        // Handle Email checkout (Existing)
        checkoutEmailBtn.addEventListener('click', () => {
            const storedDetails = JSON.parse(localStorage.getItem('tempOrderDetails'));
            if (!storedDetails) {
                alert('Delivery details not found. Please re-enter them.');
                checkoutModalOverlay.classList.remove('open');
                deliveryDetailsModalOverlay.classList.add('open'); // Re-open delivery modal
                return;
            }
            const invoiceMessage = generateInvoiceMessage(storedDetails.name, storedDetails.address, storedDetails.phone);
            const subject = encodeURIComponent('Cakes by Omon - New Order Inquiry');
            const emailBody = invoiceMessage; // The message is already URL-encoded
            const mailtoUrl = `mailto:${ownerEmail}?subject=${subject}&body=${emailBody}`;
            window.location.href = mailtoUrl;
            checkoutModalOverlay.classList.remove('open'); // Close modal after action
            localStorage.removeItem('tempOrderDetails'); // Clean up temporary storage
            cart = []; // Clear cart after order initiation
            renderCart();
        });

        // --- Calls to fetch and render products (Place these at the very end of DOMContentLoaded) ---
        fetchProductsAndRender('cakes', 'cakes-container', 'loading-cakes');
        fetchProductsAndRender('pastries', 'pastries-container', 'loading-pastries');
        fetchProductsAndRender('drinks', 'drinks-container', 'loading-drinks');

        // Initial load and render cart (Existing - ensure these are AFTER all function definitions)
        loadCart();
        renderCart();
    });
