// _INFINITE_WALLS_ Core Logic

// Initialize Default Posters
const defaultPosters = [
  {
    id: 'p1',
    title: 'Neon Cyber City',
    desc: 'Vibrant cyberpunk aesthetics for your setup.',
    cost: 499,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'p2',
    title: 'Minimal Moon',
    desc: 'Clean, dark and minimalist moon poster.',
    cost: 299,
    discount: 199,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'p3',
    title: 'Abstract Waves',
    desc: 'Smooth abstract curves in 4K resolution.',
    cost: 350,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=700&q=80'
  },
  {
    id: 'p4',
    title: 'Vintage Record',
    desc: 'Classic vintage music aesthetic.',
    cost: 250,
    discount: 0,
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=700&q=80'
  }
];

// Setup LocalStorage Data
if (!localStorage.getItem('infinite_posters')) {
  localStorage.setItem('infinite_posters', JSON.stringify(defaultPosters));
}

let cart = JSON.parse(localStorage.getItem('infinite_cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('infinite_user')) || null;

// DOM Elements
const dynamicGallery = document.getElementById('dynamicGallery');
const loginBtnNav = document.getElementById('loginBtnNav');
const logoutBtnNav = document.getElementById('logoutBtnNav');
const navAdminDashboard = document.getElementById('navAdminDashboard');
const adminDashboard = document.getElementById('adminDashboard');
const authModal = document.getElementById('authModal');
const cartModal = document.getElementById('cartModal');

// Init App
function initApp() {
  renderGallery();
  updateAuthUI();
  updateCartUI();
  calculateCustomPrice();
}

// ========================
// AUTHENTICATION LOGIC
// ========================
function openLoginModal() {
  authModal.style.display = 'block';
}

function closeLoginModal() {
  authModal.style.display = 'none';
}

function switchAuthTab(tab) {
  document.getElementById('tabUser').classList.remove('active');
  document.getElementById('tabAdmin').classList.remove('active');
  document.getElementById('userLoginForm').classList.remove('active');
  document.getElementById('adminLoginForm').classList.remove('active');

  if (tab === 'user') {
    document.getElementById('tabUser').classList.add('active');
    document.getElementById('userLoginForm').classList.add('active');
  } else {
    document.getElementById('tabAdmin').classList.add('active');
    document.getElementById('adminLoginForm').classList.add('active');
  }
}

function loginUser() {
  const user = document.getElementById('username').value;
  if (!user) return alert("Please enter a username.");
  
  currentUser = { role: 'user', name: user };
  localStorage.setItem('infinite_user', JSON.stringify(currentUser));
  closeLoginModal();
  updateAuthUI();
  alert(`Welcome, ${user}!`);
}

function handleCredentialResponse(response) {
  // Decode JWT to get user info (basic decode for frontend, no verification needed since we mock backend)
  const base64Url = response.credential.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  const decoded = JSON.parse(jsonPayload);
  
  currentUser = { role: 'user', name: decoded.name, email: decoded.email, picture: decoded.picture };
  localStorage.setItem('infinite_user', JSON.stringify(currentUser));
  closeLoginModal();
  updateAuthUI();
  alert(`Welcome via Google, ${decoded.name}!`);
}

function loginAdmin() {
  const pass = document.getElementById('adminPassword').value;
  if (pass === 'admin123') {
    currentUser = { role: 'admin', name: 'Admin' };
    localStorage.setItem('infinite_user', JSON.stringify(currentUser));
    closeLoginModal();
    updateAuthUI();
    alert("Welcome, Admin!");
  } else {
    alert("Incorrect Admin Password!");
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('infinite_user');
  updateAuthUI();
  alert("Logged out successfully.");
}

function updateAuthUI() {
  if (currentUser) {
    loginBtnNav.style.display = 'none';
    logoutBtnNav.style.display = 'inline-block';
    
    if (currentUser.role === 'admin') {
      navAdminDashboard.style.display = 'inline-block';
      adminDashboard.style.display = 'block';
    } else {
      navAdminDashboard.style.display = 'none';
      adminDashboard.style.display = 'none';
    }
  } else {
    loginBtnNav.style.display = 'inline-block';
    logoutBtnNav.style.display = 'none';
    navAdminDashboard.style.display = 'none';
    adminDashboard.style.display = 'none';
  }
}

// ========================
// GALLERY & ADMIN UPLOAD
// ========================
function renderGallery() {
  const posters = JSON.parse(localStorage.getItem('infinite_posters')) || [];
  dynamicGallery.innerHTML = '';
  
  posters.forEach(poster => {
    const finalPrice = poster.discount > 0 ? poster.discount : poster.cost;
    const originalPriceHTML = poster.discount > 0 ? `<span class="original-price">₹${poster.cost}</span>` : '';
    
    const card = document.createElement('div');
    card.className = 'poster-card';
    card.innerHTML = `
      <img src="${poster.image}" alt="${poster.title}">
      <div class="card-info">
        <h3>${poster.title}</h3>
        <p>${poster.desc}</p>
        <div class="price-row">
          <span class="current-price">₹${finalPrice}</span>
          ${originalPriceHTML}
        </div>
      </div>
      <button onclick="addToCart('${poster.id}', '${poster.title}', ${finalPrice})">Add to Cart</button>
    `;
    dynamicGallery.appendChild(card);
  });
}

// Admin Image Preview
const adminImageUpload = document.getElementById("adminImageUpload");
const adminPreview = document.getElementById("adminPreview");
let adminImageBase64 = "";

adminImageUpload.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      adminImageBase64 = event.target.result;
      adminPreview.src = adminImageBase64;
      adminPreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

function uploadAdminPoster() {
  const title = document.getElementById('adminPosterTitle').value;
  const desc = document.getElementById('adminPosterDesc').value;
  const cost = Number(document.getElementById('adminPosterCost').value);
  const discount = Number(document.getElementById('adminPosterDiscount').value) || 0;
  
  if (!title || !desc || !cost || !adminImageBase64) {
    return alert("Please fill all required fields and upload an image.");
  }
  
  const posters = JSON.parse(localStorage.getItem('infinite_posters')) || [];
  const newPoster = {
    id: 'p' + Date.now(),
    title,
    desc,
    cost,
    discount,
    image: adminImageBase64
  };
  
  posters.push(newPoster);
  localStorage.setItem('infinite_posters', JSON.stringify(posters));
  
  alert("Poster uploaded successfully!");
  
  // Reset fields
  document.getElementById('adminPosterTitle').value = '';
  document.getElementById('adminPosterDesc').value = '';
  document.getElementById('adminPosterCost').value = '';
  document.getElementById('adminPosterDiscount').value = '';
  adminImageUpload.value = '';
  adminPreview.style.display = 'none';
  adminImageBase64 = '';
  
  renderGallery();
}

// ========================
// CART LOGIC
// ========================
function openCartModal() {
  cartModal.style.display = 'block';
}

function closeCartModal() {
  cartModal.style.display = 'none';
}

function addToCart(id, title, price) {
  if (!currentUser) {
    return alert("Please login to add items to cart.");
  }
  
  cart.push({ id, title, price: Number(price) });
  localStorage.setItem('infinite_cart', JSON.stringify(cart));
  updateCartUI();
  alert(`${title} added to cart!`);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem('infinite_cart', JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  document.getElementById('cartCount').innerText = cart.length;
  
  const container = document.getElementById('cartItemsContainer');
  container.innerHTML = '';
  
  let total = 0;
  cart.forEach((item, index) => {
    total += item.price;
    container.innerHTML += `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${item.title}</h4>
          <span class="cart-item-price">₹${item.price}</span>
        </div>
        <button class="remove-btn" onclick="removeFromCart(${index})">&times;</button>
      </div>
    `;
  });
  
  document.getElementById('cartTotal').innerText = total;
}

function checkout() {
  if (cart.length === 0) return alert("Your cart is empty!");
  
  alert("Order placed successfully! We will process your amazing artwork shortly.");
  cart = [];
  localStorage.setItem('infinite_cart', JSON.stringify(cart));
  updateCartUI();
  closeCartModal();
}

// ========================
// CUSTOM POSTER LOGIC
// ========================
const size = document.getElementById("size");
const frame = document.getElementById("frame");
const quantity = document.getElementById("quantity");
const totalPrice = document.getElementById("totalPrice");
const customImageUpload = document.getElementById("imageUpload");
const customPreview = document.getElementById("preview");

size.addEventListener("change", calculateCustomPrice);
frame.addEventListener("change", calculateCustomPrice);
quantity.addEventListener("input", calculateCustomPrice);

customImageUpload.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      customPreview.src = event.target.result;
      customPreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

function calculateCustomPrice() {
  let sizePrice = Number(size.value);
  let framePrice = Number(frame.value);
  let qty = Number(quantity.value) || 1;

  if (qty < 1) {
    qty = 1;
    quantity.value = 1;
  }

  totalPrice.innerText = (sizePrice + framePrice) * qty;
}

function addCustomToCart() {
  if (!currentUser) return alert("Please login to add items to cart.");
  if (!customPreview.src) return alert("Please upload an image for your custom poster.");
  
  const text = document.getElementById("posterText").value || 'No Text';
  const selectedSize = size.options[size.selectedIndex].text;
  const price = Number(totalPrice.innerText);
  
  addToCart('custom_' + Date.now(), `Custom Poster (${selectedSize}) - ${text}`, price);
  
  // Reset
  document.getElementById("posterText").value = '';
  document.getElementById("notes").value = '';
  customPreview.style.display = 'none';
  customImageUpload.value = '';
}

// Close modals when clicking outside
window.onclick = function(event) {
  if (event.target === authModal) {
    closeLoginModal();
  }
  if (event.target === cartModal) {
    closeCartModal();
  }
}

// Boot up
initApp();