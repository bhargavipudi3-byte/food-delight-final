/* ==========================================================
   FOOD DELIGHT - Chatbot (frontend only, rule-based, no backend)
   ========================================================== */
(function () {
    const QUICK = ["📋 Menu", "💰 Prices", "🌱 Veg options", "🕒 Timings", "🛵 Delivery", "📞 Contact"];

    // ---- Build the widget ----
    const root = document.createElement("div");
    root.className = "chatbot-container";
    root.innerHTML = `
        <div class="chatbot-box" id="chatbotBox" role="dialog" aria-label="Food Delight chatbot">
            <div class="chatbot-header">
                <div class="bot-avatar"><img src="images/logo1.png" alt="Food Delight"></div>
                <div class="meta"><h3>Food Delight Assistant</h3><small>Online · replies instantly</small></div>
                <button id="clearChat" title="Clear chat" aria-label="Clear chat">🗑</button>
                <button id="closeChat" title="Close" aria-label="Close chatbot">×</button>
            </div>
            <div class="chat-messages" id="chatMessages"></div>
            <div class="quick-replies" id="quickReplies">
                ${QUICK.map(q => `<button type="button">${q}</button>`).join("")}
            </div>
            <form class="chat-input-area" id="chatForm" autocomplete="off">
                <input type="text" id="userInput" placeholder="Type your question..." maxlength="200" required>
                <button type="submit" aria-label="Send">➤</button>
            </form>
        </div>
        <button class="chatbot-toggle" id="chatbotToggle" aria-label="Open chatbot">💬</button>`;
    document.body.appendChild(root);

    const box = root.querySelector("#chatbotBox");
    const messages = root.querySelector("#chatMessages");
    const form = root.querySelector("#chatForm");
    const input = root.querySelector("#userInput");
    const toggle = root.querySelector("#chatbotToggle");

    // ---- Helpers ----
    const time = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const esc = s => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const scrollDown = () => (messages.scrollTop = messages.scrollHeight);
    const line = f => `<div class="menu-line"><span>${f.veg ? "🟢" : "🔴"} ${f.name}</span><b>₹${f.price}</b></div>`;

    function addMessage(html, who) {
        const m = document.createElement("div");
        m.className = "msg " + who;
        m.innerHTML = `<div class="bubble">${html}</div><span class="time">${time()}</span>`;
        messages.appendChild(m);
        scrollDown();
    }

    function botSay(html) {
        const t = document.createElement("div");
        t.className = "msg bot typing";
        t.innerHTML = `<div class="bubble"><span></span><span></span><span></span></div>`;
        messages.appendChild(t);
        scrollDown();
        setTimeout(() => { t.remove(); addMessage(html, "bot"); }, 600 + Math.random() * 400);
    }

    function greeting() {
        addMessage("👋 Hello! Welcome to <b>Food Delight</b>.<br>I can help with our menu, prices, timings and delivery. What would you like to know?", "bot");
    }

    // ---- Brain ----
    const has = (msg, words) => words.some(w => msg.includes(w));

    function reply(raw) {
        const msg = raw.toLowerCase().replace(/[^\w\s₹]/g, " ").replace(/\s+/g, " ").trim();
        const words = msg.split(" ");

        // specific dish
        const dish = MENU.find(f => msg.includes(f.name.toLowerCase()));
        if (dish) {
            if (has(msg, ["price", "cost", "rate", "how much"]))
                return `The price of <b>${dish.name}</b> is <b>₹${dish.price}</b>.`;
            return `${dish.veg ? "🟢" : "🔴"} <b>${dish.name}</b> – ₹${dish.price}<br>${dish.description}<br>
                <a class="bubble-link" href="menu.html?cat=${encodeURIComponent(dish.category)}">View in menu →</a>`;
        }

        if (words.some(w => ["hi", "hello", "hey", "hii", "hola"].includes(w)) || has(msg, ["good morning", "good evening", "good afternoon"]))
            return "Hello! 😊 Welcome to Food Delight. How can I help you today?";

        if (has(msg, ["thank", "thanks", "thx"])) return "You're welcome! 🍽️ Enjoy your meal at Food Delight.";
        if (words.some(w => ["bye", "goodbye"].includes(w))) return "Goodbye! 👋 Hope to serve you soon.";

        if (has(msg, ["veg options", "vegetarian", "veg food", "pure veg"]) && !has(msg, ["non veg", "nonveg"])) {
            const list = MENU.filter(f => f.veg);
            return `🌱 Vegetarian dishes (${list.length}):` + list.map(line).join("");
        }
        if (has(msg, ["non veg", "nonveg", "chicken", "meat"])) {
            const list = MENU.filter(f => !f.veg);
            return list.length ? "🍗 Non-veg dishes:" + list.map(line).join("") : "We currently have no non-veg dishes.";
        }

        // category
        const cat = Object.keys(CATEGORY_EMOJI).find(c => msg.includes(c.toLowerCase()));
        if (cat) return `${CATEGORY_EMOJI[cat]} <b>${cat}</b>:` + MENU.filter(f => f.category === cat).map(line).join("");

        if (has(msg, ["cheap", "cheapest", "lowest", "budget", "affordable"])) {
            const f = [...MENU].sort((a, b) => a.price - b.price)[0];
            return `Our most affordable dish is <b>${f.name}</b> at just <b>₹${f.price}</b>! 😋`;
        }
        if (has(msg, ["expensive", "costliest", "highest", "premium"])) {
            const f = [...MENU].sort((a, b) => b.price - a.price)[0];
            return `Our premium dish is <b>${f.name}</b> at <b>₹${f.price}</b>. 🍛`;
        }
        if (has(msg, ["recommend", "suggest", "best", "popular", "special", "favourite", "favorite"])) {
            const f = MENU[Math.floor(Math.random() * MENU.length)];
            return `How about <b>${f.name}</b> (₹${f.price})? ${f.description} 😋`;
        }

        if (has(msg, ["menu", "food list", "all food", "available", "what do you have", "dishes"]))
            return "📋 Here is our menu:" + MENU.map(line).join("") +
                `<br><a class="bubble-link" href="menu.html">Open full menu →</a>`;
        if (has(msg, ["price", "prices", "cost", "rate", "how much"]))
            return "💰 Our prices:" + MENU.map(line).join("");

        if (has(msg, ["timing", "time", "open", "close", "closing", "hours", "when"]))
            return "🕒 We are open <b>daily from 9:00 AM to 9:00 PM</b>.";
        if (has(msg, ["delivery", "deliver", "home delivery"]))
            return "🛵 Yes! We offer home delivery. Add dishes to your cart and place the order, or visit our <a class='bubble-link' href='services.html'>Services</a> page.";
        if (has(msg, ["takeaway", "take away", "pickup", "pick up", "parcel"]))
            return "🥡 Takeaway is available – order and collect it from our restaurant.";
        if (has(msg, ["dine", "table", "reservation", "book"]))
            return "🍽️ Dine-in is available daily. Walk in anytime – we'd love to host you!";
        if (has(msg, ["order", "cart", "buy", "checkout"]))
            return "🛒 Click <b>+ Add</b> on any dish in the <a class='bubble-link' href='menu.html'>Menu</a>, then open the cart icon at the top to place your order.";
        if (has(msg, ["contact", "phone", "call", "address", "location", "email", "where"]))
            return "📍 Visakhapatnam, Andhra Pradesh<br>📞 +91 14253678954<br>✉️ fooddelight@example.com<br><a class='bubble-link' href='contact.html'>Contact page →</a>";
        if (has(msg, ["about", "who are you", "restaurant", "your name"]))
            return "I'm the Food Delight assistant 🤖. Food Delight serves fresh, tasty food made with quality ingredients at affordable prices.";
        if (has(msg, ["help", "what can you do"]))
            return "You can ask me about: <br>• Menu & prices<br>• Veg options<br>• Timings<br>• Delivery & takeaway<br>• Contact details<br>Or type a dish name like <i>Masala Dosa</i>!";

        return "🤔 Sorry, I didn't get that. Try asking about our <b>menu</b>, <b>prices</b>, <b>timings</b> or <b>delivery</b>.";
    }

    function send(text) {
        text = text.trim();
        if (!text) return;
        addMessage(esc(text), "user");
        botSay(reply(text.replace(/^[^\w]+/, "")));
    }

    // ---- Events ----
    toggle.addEventListener("click", () => {
        const open = root.classList.toggle("open");
        toggle.textContent = open ? "×" : "💬";
        if (open) setTimeout(() => input.focus(), 300);
    });
    root.querySelector("#closeChat").addEventListener("click", () => {
        root.classList.remove("open");
        toggle.textContent = "💬";
    });
    root.querySelector("#clearChat").addEventListener("click", () => { messages.innerHTML = ""; greeting(); });
    form.addEventListener("submit", e => { e.preventDefault(); send(input.value); input.value = ""; });
    root.querySelector("#quickReplies").addEventListener("click", e => {
        if (e.target.tagName === "BUTTON") send(e.target.textContent);
    });

    greeting();
})();
