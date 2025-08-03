# Restaurant Backend API

A complete Node.js backend for a restaurant ordering system with real-time notifications, payment processing, and comprehensive order management.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Menu Management**: Full CRUD operations for menu items with categories and customization options
- **Order System**: Complete order lifecycle management with real-time updates
- **Payment Processing**: Stripe integration for secure payments and refunds
- **Real-time Notifications**: Socket.IO for live order updates and admin notifications
- **User Management**: Admin panel for user management and statistics
- **Data Validation**: Comprehensive input validation and error handling
- **Security**: Helmet, CORS, and secure password hashing

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Payment**: Stripe API
- **Real-time**: Socket.IO
- **Validation**: Express Validator
- **Security**: Helmet, bcryptjs, CORS

## Installation

1. **Clone and install dependencies**:
```bash
cd backend
npm install
```

2. **Environment Setup**:
```bash
cp .env.example .env
```

3. **Configure environment variables** in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/restaurant_db
JWT_SECRET=your_super_secure_jwt_secret_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
FRONTEND_URL=http://localhost:3000
```

4. **Start MongoDB** (make sure MongoDB is running)

5. **Seed the database** (optional):
```bash
node utils/seedData.js
```

6. **Start the server**:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout

### Menu Management
- `GET /api/menu` - Get all menu items (with filters)
- `GET /api/menu/categories` - Get menu categories
- `GET /api/menu/:id` - Get single menu item
- `POST /api/menu` - Create menu item (Admin)
- `PUT /api/menu/:id` - Update menu item (Admin)
- `DELETE /api/menu/:id` - Delete menu item (Admin)
- `PATCH /api/menu/:id/toggle-availability` - Toggle availability (Admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/stats` - Get order statistics (Admin)
- `GET /api/orders/:id` - Get single order
- `PATCH /api/orders/:id/status` - Update order status (Admin)
- `PATCH /api/orders/:id/cancel` - Cancel order

### Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/toggle-status` - Toggle user status

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Get payment history
- `POST /api/payments/refund` - Process refund (Admin)
- `POST /api/payments/webhook` - Stripe webhook handler

## Real-time Events

### Socket.IO Events

**Admin Events**:
- `new-order` - New order notification
- `payment-confirmed` - Payment confirmation
- `order-cancelled` - Order cancellation

**User Events**:
- `order-status-updated` - Order status changes

## Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['client', 'admin'],
  phone: String,
  address: Object,
  isActive: Boolean,
  lastLogin: Date
}
```

### MenuItem Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String,
  available: Boolean,
  ingredients: [String],
  customizationOptions: Object,
  preparationTime: Number
}
```

### Order Model
```javascript
{
  orderNumber: String (auto-generated),
  user: ObjectId,
  customerInfo: Object,
  items: [OrderItem],
  subtotal: Number,
  tax: Number,
  total: Number,
  status: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
  paymentStatus: ['pending', 'paid', 'failed', 'refunded'],
  paymentDetails: Object
}
```

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Express Validator for all inputs
- **CORS Protection**: Configured for frontend domain
- **Helmet**: Security headers
- **Rate Limiting**: Can be added for production
- **Role-based Access**: Admin vs client permissions

## Error Handling

- **Global Error Handler**: Centralized error processing
- **Validation Errors**: Detailed validation feedback
- **Database Errors**: Mongoose error handling
- **JWT Errors**: Token validation errors
- **Custom Error Messages**: User-friendly error responses

## Development

### Seed Data
Run the seed script to populate the database with sample data:
```bash
node utils/seedData.js
```

**Default Credentials**:
- Admin: `admin@restaurant.com` / `admin123`
- Client: `john@example.com` / `client123`

### Testing
The API can be tested using tools like Postman or curl. All endpoints return JSON responses with consistent structure:

```javascript
{
  success: boolean,
  message: string,
  data: object,
  errors: array (for validation errors)
}
```

## Production Deployment

1. **Set NODE_ENV=production**
2. **Configure production MongoDB URI**
3. **Set secure JWT_SECRET**
4. **Configure Stripe production keys**
5. **Set up proper CORS origins**
6. **Add rate limiting middleware**
7. **Set up logging (Winston/Morgan)**
8. **Configure SSL/HTTPS**

## Socket.IO Integration

The backend includes Socket.IO for real-time features:
- Admin notifications for new orders
- Order status updates for customers
- Payment confirmations
- Live dashboard updates

Connect from frontend:
```javascript
import io from 'socket.io-client';
const socket = io('http://localhost:5000');

// Join admin room (for admins)
socket.emit('join-admin');

// Listen for new orders
socket.on('new-order', (data) => {
  console.log('New order received:', data);
});
```

This backend provides a complete foundation for a restaurant ordering system with all the features needed for a production application.