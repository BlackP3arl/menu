# Restaurant QR Ordering System

A comprehensive web-based QR code ordering system for restaurants with real-time order management, built with React, Node.js, and Supabase.

## Features

### Customer Features
- ✅ QR code scanning for table-based ordering
- ✅ Interactive menu browsing with categories
- ✅ Item customization (size, preparation, add-ons)
- ✅ Shopping cart management
- ✅ Real-time order tracking
- ✅ Mobile-responsive design

### Kitchen Features
- ✅ Real-time order dashboard
- ✅ Order status management (New → In Progress → Ready)
- ✅ Individual item completion tracking
- ✅ Special instructions display

### Staff Features
- ✅ Ready orders for service
- ✅ Order delivery management
- ✅ Bill generation and printing
- ✅ Payment tracking

### Technical Features
- ✅ Real-time updates with Socket.IO
- ✅ Supabase integration for data management
- ✅ Ant Design UI components
- ✅ Responsive design for all screen sizes
- ✅ Session-based cart persistence

## Tech Stack

- **Frontend**: React 18, Ant Design 5, React Router, Zustand
- **Backend**: Node.js, Express, Socket.IO
- **Database**: Supabase (PostgreSQL)
- **Build Tool**: Vite
- **Styling**: Ant Design + Custom CSS

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Supabase Database
1. Go to [Supabase](https://supabase.com) and create a new project
2. Run the SQL schema from `database/schema.sql` in your Supabase SQL editor
3. Copy your project URL and anon key

### 3. Configure Environment Variables
```bash
cp .env.example .env
```

Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_IMAGE_UPLOAD_URL=your_imagekit_url
IMAGE_UPLOAD_API_KEY=your_imagekit_api_key
```

### 4. Run the Application
```bash
# Start both frontend and backend
npm run dev

# Or run separately:
npm run client:dev  # Frontend on http://localhost:5173
npm run server:dev  # Backend on http://localhost:3001
```

## Usage

### For Customers
1. Scan QR code at restaurant table
2. Browse menu and customize items
3. Add items to cart and place order
4. Track order status in real-time

### For Kitchen Staff
Visit: `http://localhost:5173/kitchen/{restaurant-id}`
- View new orders in real-time
- Mark orders as in progress
- Track individual item completion
- Mark orders as ready for service

### For Service Staff
Visit: `http://localhost:5173/staff/{restaurant-id}`
- See orders ready for delivery
- Mark orders as served
- Generate and print bills
- Track payment status

## QR Code Format

QR codes should contain URLs in this format:
```
https://your-domain.com/menu/{restaurant-id}/{table-number}
```

Example:
```
https://restaurant-app.com/menu/550e8400-e29b-41d4-a716-446655440000/1
```

## Database Schema

The system uses the following main tables:
- `restaurants` - Restaurant information
- `tables` - Table configuration and QR codes
- `categories` - Menu categories
- `menu_items` - Menu items with pricing
- `item_options` - Customization options (size, preparation, add-ons)
- `orders` - Customer orders
- `order_items` - Individual items in orders
- `order_item_options` - Selected options for each item

## Order Status Flow

```
New → In Progress → Ready → Served → Paid
```

- **New**: Order just placed by customer
- **In Progress**: Kitchen is preparing the order
- **Ready**: Order completed and ready for pickup/delivery
- **Served**: Order delivered to customer table
- **Paid**: Payment completed

## Real-time Features

The system uses Socket.IO for real-time updates:
- New orders appear instantly in kitchen dashboard
- Order status changes sync across all interfaces
- Cart updates in real-time
- Order tracking updates automatically

## Development

### Project Structure
```
src/
├── components/         # Reusable UI components
│   └── customer/      # Customer-specific components
├── pages/             # Route components
├── stores/            # Zustand state management
├── utils/             # API utilities and helpers
└── types/             # Type definitions

server/
├── index.js           # Express server with Socket.IO
├── routes/            # API routes (future)
└── middleware/        # Custom middleware (future)

database/
└── schema.sql         # Supabase database schema
```

### Key Files
- `src/utils/api.js` - Supabase API functions
- `src/stores/cartStore.js` - Shopping cart state management
- `src/stores/orderStore.js` - Order state management
- `server/index.js` - WebSocket server for real-time updates

## Deployment

### Frontend (Vercel/Netlify)
1. Build the application: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in deployment platform

### Backend (Railway/Heroku)
1. Deploy the server folder
2. Set `NODE_ENV=production`
3. Configure environment variables

### Database (Supabase)
1. Set up production Supabase project
2. Run database schema
3. Configure Row Level Security policies
4. Update environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the GitHub issues
2. Create a new issue with detailed description
3. Include error logs and steps to reproduce

---

Built with ❤️ for the restaurant industry