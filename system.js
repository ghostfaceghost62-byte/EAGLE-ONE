// Global State
let products = JSON.parse(localStorage.getItem('eagle_products')) || [];
let cart = JSON.parse(localStorage.getItem('eagle_cart')) || [];
let users = JSON.parse(localStorage.getItem('eagle_users')) || [];
let orders = JSON.parse(localStorage.getItem('eagle_orders')) || [];

function saveAll() {
    localStorage.setItem('eagle_products', JSON.stringify(products));
    localStorage.setItem('eagle_cart', JSON.stringify(cart));
    localStorage.setItem('eagle_users', JSON.stringify(users));
    localStorage.setItem('eagle_orders', JSON.stringify(orders));
}

function logout() {
    localStorage.removeItem('eagle_active_user');
    window.location.replace('index.html');
}

// STORE LOGIC
function renderStore(filter = "") {
    const grid = document.getElementById('store-grid');
    if (!grid) return;

    grid.innerHTML = "";
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));

    if (filteredProducts.length === 0) {
        grid.innerHTML = "<p style='grid-column: 1/-1; text-align: center;'>No gear found matching your search.</p>";
        return;
    }

    filteredProducts.forEach(p => {
        const isOutOfStock = p.stock <= 0;
        grid.innerHTML += `
        <div class="product-card ${isOutOfStock ? 'out-of-stock' : ''}">
            <img src="${p.image || 'https://via.placeholder.com/250x250?text=NO+IMAGE'}" class="product-img" alt="${p.name}">
            <h3>${p.name}</h3>
            <span class="price">₱${p.price.toLocaleString()}</span>
            <p class="stock-info">Stock: ${p.stock}</p>
            <button class="${isOutOfStock ? 'btn-outline' : 'btn-primary'} add-btn" 
                    onclick="addToCart(${p.id})" ${isOutOfStock ? "disabled" : ""}>
                ${isOutOfStock ? "OUT OF STOCK" : "ADD TO GEAR"}
            </button>
        </div>`;
    });
}

function filterStore() {
    const searchInput = document.getElementById('product-search');
    if (searchInput) renderStore(searchInput.value);
}

// CART LOGIC
function toggleCart() {
    const cartEl = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if(cartEl && overlay) {
        cartEl.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

function addToCart(id) {
    const p = products.find(p => p.id === id);
    const item = cart.find(i => i.id === id);

    if (item) {
        if (item.qty >= p.stock) return alert("Maximum stock reached for this item.");
        item.qty++;
    } else {
        cart.push({ ...p, qty: 1 });
    }
    updateCart();
    
    const cartEl = document.getElementById('cart-sidebar');
    if (cartEl && !cartEl.classList.contains('active')) toggleCart();
}

function updateCart() {
    const itemsContainer = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const countEl = document.getElementById('cart-count');

    if (!itemsContainer || !totalEl || !countEl) return;

    let total = 0;
    let htmlString = "";

    cart.forEach((i, idx) => {
        total += i.price * i.qty;
        htmlString += `
        <div class="cart-item">
            <div class="item-details">
                <strong>${i.name}</strong>
                <span>₱${i.price.toLocaleString()}</span>
            </div>
            <div class="item-controls">
                <button class="btn-qty" onclick="changeQty(${idx}, -1)">-</button>
                <span class="qty-display">${i.qty}</span>
                <button class="btn-qty" onclick="changeQty(${idx}, 1)">+</button>
            </div>
        </div>`;
    });

    itemsContainer.innerHTML = htmlString || "<p style='text-align:center; margin-top: 2rem; color: #88888e;'>Your gear bag is empty.</p>";
    totalEl.innerText = "₱" + total.toLocaleString();
    countEl.innerText = cart.reduce((a, b) => a + b.qty, 0);

    saveAll();
}

function changeQty(index, val) {
    cart[index].qty += val;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    updateCart();
}

function goCheckout() {
    if (cart.length === 0) return alert("Your cart is empty.");
    window.location.href = "checkout.html";
}

// CHECKOUT LOGIC
function placeOrder() {
    if (!cart.length) return alert("Your cart is empty.");

    const nameInput = document.getElementById('chk-name');
    const name = nameInput ? nameInput.value.trim() : "Unknown Operator";
    
    if(!name) return alert("Please enter your name.");

    cart.forEach(c => {
        const p = products.find(prod => prod.id === c.id);
        if(p) p.stock -= c.qty;
    });

    const total = cart.reduce((a, b) => a + (b.price * b.qty), 0);

    orders.push({
        id: Date.now(),
        customer: name,
        items: [...cart],
        total,
        date: new Date().toLocaleDateString()
    });

    cart = [];
    saveAll();
    alert("ORDER CONFIRMED. PREPARING DEPLOYMENT.");
    window.location.replace("index.html");
}

// ADMIN LOGIC
function renderAdmin() {
    if (document.getElementById('product-table-body')) renderProducts();
    if (document.getElementById('user-table')) renderUsers();
    if (document.getElementById('orders-list')) renderOrders();
}

function renderProducts() {
    const tb = document.getElementById('product-table-body');
    if (!tb) return;

    tb.innerHTML = products.map(p => `
    <tr>
        <td><img src="${p.image || 'https://via.placeholder.com/50'}" width="50" style="border-radius:4px;"></td>
        <td><strong>${p.name}</strong></td>
        <td>₱${p.price.toLocaleString()}</td>
        <td>${p.stock}</td>
        <td>
            <div class="action-btns">
                <button class="btn-outline" onclick="editProduct(${p.id})">Edit</button>
                <button class="btn-danger" onclick="deleteProduct(${p.id})">Del</button>
            </div>
        </td>
    </tr>`).join('');
}

function saveProduct() {
    const name = document.getElementById('p-name').value.trim();
    const price = parseFloat(document.getElementById('p-price').value);
    const stock = parseInt(document.getElementById('p-stock').value);
    const img = document.getElementById('p-img').value.trim();
    const id = document.getElementById('p-id').value;

    if (!name || isNaN(price) || isNaN(stock)) return alert("Please fill all required fields.");

    if (id) {
        const i = products.findIndex(p => p.id == id);
        if(i > -1) products[i] = { id: parseInt(id), name, price, stock, image: img };
    } else {
        products.push({ id: Date.now(), name, price, stock, image: img });
    }

    const form = document.getElementById('admin-product-form');
    if (form) form.reset();
    document.getElementById('p-id').value = '';

    saveAll();
    renderProducts();
}

function editProduct(id) {
    const p = products.find(p => p.id === id);
    if(!p) return;
    document.getElementById('p-id').value = p.id;
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-price').value = p.price;
    document.getElementById('p-stock').value = p.stock;
    document.getElementById('p-img').value = p.image;
}

function deleteProduct(id) {
    if(confirm("Delete this product?")) {
        products = products.filter(p => p.id !== id);
        saveAll();
        renderProducts();
    }
}

function renderUsers() {
    const tb = document.getElementById('user-table');
    if (!tb) return;

    tb.innerHTML = users.map((u, i) => `
    <tr>
        <td>${u.username}</td>
        <td><span class="badge ${u.role}">${u.role.toUpperCase()}</span></td>
        <td>
            ${u.role !== "admin" ? `<button class="btn-danger" onclick="deleteUser(${i})">Revoke</button>` : "<span>Protected</span>"}
        </td>
    </tr>`).join('');
}

function deleteUser(i) {
    if(confirm("Revoke operator access?")) {
        users.splice(i, 1);
        saveAll();
        renderUsers();
    }
}

function renderOrders() {
    const div = document.getElementById('orders-list');
    if (!div) return;

    if(orders.length === 0) {
        div.innerHTML = "<p>No deployment logs found.</p>";
        return;
    }

    div.innerHTML = orders.slice().reverse().map(o => `
    <div class="admin-card">
        <h3>Order #${o.id}</h3>
        <p><strong>Customer:</strong> ${o.customer}</p>
        <p><strong>Total:</strong> ₱${o.total.toLocaleString()}</p>
        <div style="margin-top:10px; font-size:0.85rem; color:#88888e;">
            ${o.items.map(i => `${i.name} x${i.qty}`).join(", ")}
        </div>
    </div>`).join('');
}

function switchAdminTab(e, tab) {
    document.querySelectorAll(".main-content section").forEach(s => s.classList.add("hidden"));
    document.querySelectorAll(".nav-links a").forEach(a => a.classList.remove("active"));
    
    const targetSection = document.getElementById("view-" + tab);
    if (targetSection) targetSection.classList.remove("hidden");
    if (e) e.currentTarget.classList.add("active");
}

// INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('store-grid')) renderStore();
    updateCart();
    renderAdmin();
});

function renderCollections() {
    const div = document.getElementById('collections-display');
    if(!div) return;

    const collections = JSON.parse(localStorage.getItem('eagle_collections')) || { offers:[], newArrivals:[], bestSellers:[] };
    
    div.innerHTML = `
        ${Object.entries(collections).map(([key, arr]) => `
            <div>
                <h3>${key.replace(/([A-Z])/g, ' $1').toUpperCase()}</h3>
                <ul>
                    ${arr.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `).join('')}
    `;
}