// Menu data (kept in JS so the site works by simply double-clicking index.html - no server needed)
const MENU = [
    { id: 1, name: "Chicken Biryani", price: 220, category: "Main Course", veg: false, image: "biryani.jpg",
      description: "Delicious chicken biryani prepared with aromatic spices." },
    { id: 2, name: "Cheese Pizza", price: 180, category: "Fast Food", veg: true, image: "pizza.jpg",
      description: "Freshly baked pizza topped with cheese and vegetables." },
    { id: 3, name: "Veg Burger", price: 100, category: "Fast Food", veg: true, image: "veg_burger.jpg",
      description: "Crispy vegetable patty with fresh lettuce and sauce." },
    { id: 4, name: "Masala Dosa", price: 80, category: "South Indian", veg: true, image: "dosa.jpg",
      description: "Crispy dosa served with potato masala and chutney." },
    { id: 5, name: "Veg Noodles", price: 130, category: "Chinese", veg: true, image: "noodles.jpg",
      description: "Delicious noodles prepared with fresh vegetables." },
    { id: 6, name: "Chocolate Brownie", price: 120, category: "Dessert", veg: true, image: "chocolate_brownie.jpg",
      description: "Soft and rich chocolate brownie." },
    { id: 7, name: "French Fries", price: 90, category: "Snacks", veg: true, image: "french_fries.jpg",
      description: "Golden and crispy potato fries." },
    { id: 8, name: "Veg Sandwich", price: 110, category: "Snacks", veg: true, image: "veg_sandwich.jpg",
      description: "Fresh vegetable sandwich with delicious filling." }
];

const CATEGORY_EMOJI = {
    "Main Course": "🍛", "Fast Food": "🍔", "South Indian": "🥞",
    "Chinese": "🍜", "Dessert": "🍰", "Snacks": "🍟"
};
