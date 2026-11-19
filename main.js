/* ==========================================================
   FOOD DELIGHT - Main JavaScript
   Nav, menu rendering/filtering, cart, contact form
   ========================================================== */

// ---------- Helpers ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const rupees = n => "₹" + n;

function foodCardHTML(f) {
    return `
    <div class="food-card">
        <div class="food-image">
            <img src="images/${f.image}" alt="${f.name}" loading="lazy">
            <span class="category-tag">${f.category}</span>
            <span class="veg-dot ${f.veg ? "" : "nonveg"}" title="${f.veg ? "Vegetarian" : "Non-vegetarian"}"></span>
        </div>
        <div class="food-info">
            <h3>${f.name}</h3>
            <p>${f.description}</p>
            <div class="food-bottom">
                <span class="price">${rupees(f.price)}</span>
                <button class="add-btn" data-add="${f.id}">+ Add</button>
            </div>
        </div>
    </div>`;
}

// ---------- Toast ----------
let toastTimer;
function showToast(msg) {
    let t = $("#toast");
    if (!t) {
        t = document.createElement("div");
        t.id = "toast";
        t.className = "toast";
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
}

// ---------- Cart (saved in browser localStorage - no database) ----------
const Cart = {
    items: [],
    load() {
        try { this.items = JSON.parse(localStorage.getItem("fd_cart")) || []; }
        catch { this.items = []; }
    },
    save() {
        try { localStorage.setItem("fd_cart", JSON.stringify(this.items)); } catch {}
    },
    add(id) {
        const found = this.items.find(i => i.id === id);
        found ? found.qty++ : this.items.push({ id, qty: 1 });
        this.save(); this.render();
    },
    change(id, delta) {
        const it = this.items.find(i => i.id === id);
        if (!it) return;
        it.qty += delta;
        if (it.qty <= 0) this.items = this.items.filter(i => i.id !== id);
        this.save(); this.render();
    },
    remove(id) { this.items = this.items.filter(i => i.id !== id); this.save(); this.render(); },
    clear() { this.items = []; this.save(); this.render(); },
    count() { return this.items.reduce((s, i) => s + i.qty, 0); },
    total() { return this.items.reduce((s, i) => s + i.qty * MENU.find(m => m.id === i.id).price, 0); },

    build() {
        document.body.insertAdjacentHTML("beforeend", `
        <div class="overlay" id="overlay"></div>
        <aside class="cart-drawer" id="cartDrawer" aria-label="Shopping cart">
            <div class="cart-head"><h3>🛒 Your Order</h3><button id="closeCart" aria-label="Close cart">×</button></div>
            <div class="cart-items" id="cartItems"></div>
            <div class="cart-foot" id="cartFoot"></div>
        </aside>`);
        $("#overlay").addEventListener("click", () => this.close());
        $("#closeCart").addEventListener("click", () => this.close());
        $("#cartItems").addEventListener("click", e => {
            const b = e.target.closest("button[data-act]");
            if (!b) return;
            const id = +b.dataset.id;
            if (b.dataset.act === "inc") this.change(id, 1);
            if (b.dataset.act === "dec") this.change(id, -1);
            if (b.dataset.act === "rm") this.remove(id);
        });
        $("#cartFoot").addEventListener("click", e => {
            if (e.target.id === "checkoutBtn") {
                showToast("🎉 Order placed! (demo - no payment)");
                this.clear(); this.close();
            }
            if (e.target.id === "clearCart") this.clear();
        });
    },
    open() { $("#cartDrawer").classList.add("open"); $("#overlay").classList.add("show"); },
    close() { $("#cartDrawer").classList.remove("open"); $("#overlay").classList.remove("show"); },

    render() {
        const n = this.count();
        $$(".cart-count").forEach(c => { c.textContent = n; c.classList.toggle("hidden", n === 0); });
        const box = $("#cartItems"), foot = $("#cartFoot");
        if (!box) return;
        if (!this.items.length) {
            box.innerHTML = `<div class="cart-empty"><span>🍽️</span>Your cart is empty.<br>Add some tasty food!</div>`;
            foot.innerHTML = "";
            return;
        }
        box.innerHTML = this.items.map(i => {
            const f = MENU.find(m => m.id === i.id);
            return `
            <div class="cart-item">
                <img src="images/${f.image}" alt="${f.name}">
                <div class="cart-item-info">
                    <h4>${f.name}</h4>
                    <small>${rupees(f.price * i.qty)}</small>
                    <div class="qty">
                        <button data-act="dec" data-id="${f.id}" aria-label="Decrease">−</button>
                        <span>${i.qty}</span>
                        <button data-act="inc" data-id="${f.id}" aria-label="Increase">+</button>
                    </div>
                </div>
                <button class="remove-item" data-act="rm" data-id="${f.id}" aria-label="Remove">🗑</button>
            </div>`;
        }).join("");
        foot.innerHTML = `
            <div class="cart-total"><span>Total</span><span>${rupees(this.total())}</span></div>
            <button class="btn" id="checkoutBtn">Place Order</button>
            <button class="clear-cart" id="clearCart">Clear cart</button>`;
    }
};

// ---------- Navigation ----------
function initNav() {
    const toggle = $("#menuToggle"), links = $("#navLinks");
    if (toggle) {
        toggle.addEventListener("click", () => links.classList.toggle("open"));
        $$("a", links).forEach(a => a.addEventListener("click", () => links.classList.remove("open")));
    }
    // highlight current page
    const page = location.pathname.split("/").pop() || "index.html";
    $$("#navLinks a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === page));
    $$("[data-open-cart]").forEach(b => b.addEventListener("click", () => Cart.open()));
}

// ---------- Home page: popular foods ----------
function initHome() {
    const grid = $("#featuredGrid");
    if (!grid) return;
    grid.innerHTML = MENU.slice(0, 4).map(foodCardHTML).join("");
    const strip = $("#categoryStrip");
    if (strip) {
        strip.innerHTML = Object.keys(CATEGORY_EMOJI).map(c => `
            <a class="category-chip" href="menu.html?cat=${encodeURIComponent(c)}">
                <span class="emoji">${CATEGORY_EMOJI[c]}</span><span>${c}</span>
            </a>`).join("");
    }
}

// ---------- Menu page: filter + search ----------
function initMenu() {
    const grid = $("#menuGrid");
    if (!grid) return;
    const tabs = $("#filterTabs"), search = $("#searchInput");
    const cats = ["All", ...Object.keys(CATEGORY_EMOJI)];
    let active = new URLSearchParams(location.search).get("cat");
    if (!cats.includes(active)) active = "All";

    tabs.innerHTML = cats.map(c =>
        `<button class="filter-btn ${c === active ? "active" : ""}" data-cat="${c}">${c}</button>`).join("");

    function draw() {
        const q = search.value.trim().toLowerCase();
        const list = MENU.filter(f =>
            (active === "All" || f.category === active) &&
            (f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)));
        grid.innerHTML = list.length ? list.map(foodCardHTML).join("")
            : `<p class="empty-menu">😕 No dishes found. Try another search.</p>`;
    }
    tabs.addEventListener("click", e => {
        const b = e.target.closest(".filter-btn");
        if (!b) return;
        active = b.dataset.cat;
        $$(".filter-btn", tabs).forEach(x => x.classList.toggle("active", x === b));
        draw();
    });
    search.addEventListener("input", draw);
    draw();
}

// ---------- Contact form (frontend validation only) ----------
function initContact() {
    const form = $("#contactForm");
    if (!form) return;
    const rules = {
        name: v => v.trim().length >= 2,
        email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: v => v.trim().length >= 10
    };
    form.addEventListener("submit", e => {
        e.preventDefault();
        let ok = true;
        Object.keys(rules).forEach(k => {
            const input = form.elements[k];
            const valid = rules[k](input.value);
            input.closest(".form-group").classList.toggle("invalid", !valid);
            if (!valid) ok = false;
        });
        if (ok) {
            $("#formSuccess").classList.add("show");
            form.reset();
            setTimeout(() => $("#formSuccess").classList.remove("show"), 5000);
        }
    });
    $$("input, textarea", form).forEach(i =>
        i.addEventListener("input", () => i.closest(".form-group").classList.remove("invalid")));
}

// ---------- Global click: add to cart buttons ----------
document.addEventListener("click", e => {
    const b = e.target.closest("[data-add]");
    if (!b) return;
    const id = +b.dataset.add;
    Cart.add(id);
    showToast("✅ " + MENU.find(m => m.id === id).name + " added to cart");
});

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
    Cart.load();
    Cart.build();
    Cart.render();
    initNav();
    initHome();
    initMenu();
    initContact();
});
