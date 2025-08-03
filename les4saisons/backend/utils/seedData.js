const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant_db');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@restaurant.com',
      password: adminPassword,
      role: 'admin'
    });

    // Create sample client
    const clientPassword = await bcrypt.hash('client123', 12);
    const client = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: clientPassword,
      role: 'client'
    });

    console.log('Created users');

    // Create menu items
    const menuItems = [
      {
        name: 'Margherita Pizza',
        description: 'Fresh mozzarella, tomato sauce, and basil on crispy thin crust',
        price: 18.99,
        category: 'Pizza',
        image: 'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg?auto=compress&cs=tinysrgb&w=500',
        available: true,
        ingredients: ['mozzarella', 'tomato sauce', 'basil', 'pizza dough'],
        preparationTime: 15
      },
      {
        name: 'Pepperoni Pizza',
        description: 'Classic pepperoni with mozzarella cheese and tomato sauce',
        price: 21.99,
        category: 'Pizza',
        image: 'https://images.pexels.com/photos/4109111/pexels-photo-4109111.jpeg?auto=compress&cs=tinysrgb&w=500',
        available: true,
        ingredients: ['pepperoni', 'mozzarella', 'tomato sauce', 'pizza dough'],
        preparationTime: 15
      },
      {
        name: 'Caesar Salad',
        description: 'Crisp romaine lettuce, parmesan cheese, croutons, and Caesar dressing',
        price: 14.99,
        category: 'Salads',
        image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=500',
        available: true,
        ingredients: ['romaine lettuce', 'parmesan cheese', 'croutons', 'caesar dressing'],
        preparationTime: 10
      },
      {
        name: 'Grilled Salmon',
        description: 'Fresh Atlantic salmon with herbs and lemon, served with vegetables',
        price: 28.99,
        category: 'Main Course',
        image: 'https://images.pexels.com/photos/3819969/pexels-photo-3819969.jpeg?auto=compress&cs=tinysrgb&w=500',
        available: true,
        ingredients: ['salmon', 'herbs', 'lemon', 'vegetables'],
        preparationTime: 20
      },
      {
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
        price: 12.99,
        category: 'Desserts',
        image: 'https://images.pexels.com/photos/2715392/pexels-photo-2715392.jpeg?auto=compress&cs=tinysrgb&w=500',
        available: true,
        ingredients: ['chocolate', 'flour', 'eggs', 'vanilla ice cream'],
        preparationTime: 15
      },
      {
        name: 'Craft Beer',
        description: 'Local craft beer selection - ask your server for today\'s options',
        price: 6.99,
        category: 'Beverages',
        image: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=500',
        available: true,
        ingredients: ['hops', 'malt', 'yeast'],
        preparationTime: 2
      },
      {
        name: 'Classic Beef Taco',
        description: 'Authentic Mexican taco with your choice of size, meats, and toppings',
        price: 8.99,
        category: 'Tacos',
        image: 'https://images.pexels.com/photos/4958792/pexels-photo-4958792.jpeg?auto=compress&cs=tinysrgb&w=500',
        available: true,
        customizationOptions: {
          sizes: [
            { name: 'Small', price: 0, maxMeats: 1 },
            { name: 'Medium', price: 1.50, maxMeats: 1 },
            { name: 'Large', price: 3.00, maxMeats: 2 },
            { name: 'Extra Large', price: 4.50, maxMeats: 3 },
            { name: 'Double XL', price: 6.00, maxMeats: 4 }
          ],
          meats: ['Beef', 'Chicken', 'Pork', 'Fish', 'Shrimp', 'Chorizo', 'Carnitas', 'Al Pastor'],
          sauces: ['Mild Salsa', 'Hot Salsa', 'Verde Salsa', 'Chipotle', 'Habanero', 'Sour Cream', 'Guacamole', 'Pico de Gallo'],
          supplements: [
            { name: 'Extra Cheese', price: 1.00 },
            { name: 'Avocado', price: 1.50 },
            { name: 'Jalapeños', price: 0.50 },
            { name: 'Onions', price: 0.50 },
            { name: 'Cilantro', price: 0.50 },
            { name: 'Lime', price: 0.25 },
            { name: 'Lettuce', price: 0.50 },
            { name: 'Tomatoes', price: 0.75 }
          ],
          sides: ['Regular Fries', 'Seasoned Fries', 'Sweet Potato Fries', 'Loaded Fries'],
          drinks: ['Coca Cola', 'Pepsi', 'Sprite', 'Orange Soda', 'Water', 'Horchata', 'Jamaica', 'Tamarindo']
        },
        preparationTime: 12
      },
      {
        name: 'Classic Smash Burger',
        description: 'Double smashed beef patties with cheese and special sauce',
        price: 12.99,
        category: 'Smashes',
        image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=500',
        available: true,
        customizationOptions: {
          sauces: ['Ketchup', 'Mustard', 'Mayo', 'BBQ Sauce', 'Chipotle Mayo', 'Garlic Aioli', 'Spicy Mayo', 'Thousand Island', 'Ranch', 'Buffalo Sauce'],
          sides: ['Regular Fries', 'Seasoned Fries', 'Sweet Potato Fries', 'Loaded Fries', 'Curly Fries', 'Onion Rings'],
          drinks: ['Coca Cola', 'Pepsi', 'Sprite', 'Orange Soda', 'Water', 'Iced Tea', 'Lemonade', 'Coffee', 'Milkshake Vanilla', 'Milkshake Chocolate']
        },
        preparationTime: 15
      },
      {
        name: 'Classic Burger',
        description: 'Juicy beef patty with fresh ingredients and house sauce',
        price: 11.99,
        category: 'Burgers',
        image: 'https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=500',
        available: true,
        customizationOptions: {
          sauces: ['Ketchup', 'Mustard', 'Mayo', 'BBQ Sauce', 'Chipotle Mayo', 'Garlic Aioli', 'Spicy Mayo', 'Thousand Island', 'Ranch', 'Buffalo Sauce'],
          sides: ['Regular Fries', 'Seasoned Fries', 'Sweet Potato Fries', 'Loaded Fries', 'Curly Fries', 'Onion Rings'],
          drinks: ['Coca Cola', 'Pepsi', 'Sprite', 'Orange Soda', 'Water', 'Iced Tea', 'Lemonade', 'Coffee', 'Milkshake Vanilla', 'Milkshake Chocolate']
        },
        preparationTime: 15
      }
    ];

    await MenuItem.insertMany(menuItems);
    console.log('Created menu items');

    console.log('Seed data created successfully!');
    console.log('Admin credentials: admin@restaurant.com / admin123');
    console.log('Client credentials: john@example.com / client123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();