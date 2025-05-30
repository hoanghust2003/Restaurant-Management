# Restaurant Management System

A comprehensive system for managing restaurant operations including menu management, order processing, inventory control, and customer ordering through QR codes.

## Features

### QR Code Table Ordering

The system allows customers to scan QR codes placed on restaurant tables to access a digital menu and place orders directly from their devices.

#### How It Works

1. **QR Code Generation**: The system generates unique QR codes for each table in the restaurant.
2. **Table Association**: Each QR code contains a URL that includes the table's unique identifier.
3. **Customer Scanning**: When customers scan a QR code, they are directed to the restaurant's menu page with their table ID automatically recognized.
4. **Seamless Ordering**: Customers can browse the menu, add items to their cart, and place orders without needing to install an app.
5. **Table Identification**: Orders are automatically associated with the correct table, streamlining the service process.

#### Benefits

- **Contactless Ordering**: Minimizes physical contact with menus and staff.
- **Reduced Wait Times**: Customers can place orders as soon as they're seated.
- **Error Reduction**: Eliminates order-taking errors and ensures accurate table identification.
- **Enhanced Analytics**: Provides data on table utilization, ordering patterns, and customer preferences.

### Key Components

#### For Restaurant Staff

- **QR Code Management**: Generate, print, and manage QR codes for all tables.
- **Order Monitoring**: Real-time updates on incoming orders from tables.
- **Table Status Tracking**: See which tables are occupied, ordered, or ready for service.

#### For Customers

- **Digital Menu Access**: Easily access the complete menu through a QR code scan.
- **Table-Specific Ordering**: Orders are automatically linked to their table.
- **Order Tracking**: View order status and estimated preparation time.
- **Special Instructions**: Add notes or special requests for each dish.

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- PostgreSQL database

### Installation

#### Backend Setup

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up your environment variables in `.env`:

   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/restaurant_db
   JWT_SECRET=your_jwt_secret
   FRONTEND_URL=http://localhost:3000
   ```

4. Run database migrations:

   ```bash
   npm run migrate
   ```

5. Start the development server:
   ```bash
   npm run start:dev
   ```

#### Frontend Setup

1. Navigate to the client directory:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up your environment variables in `.env.local`:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Testing the QR Code Feature

1. Log in as an administrator
2. Navigate to the QR Code Management page
3. Generate QR codes for tables
4. Print or download the QR codes
5. Scan a QR code with a mobile device
6. The menu should open with the correct table ID recognized
7. Add items to cart and place an order
8. Verify the order is received in the system with the correct table association

## Documentation

Additional documentation can be found in:

- [QR_CODE_TEST_PLAN.md](./QR_CODE_TEST_PLAN.md) - Comprehensive test plan for the QR code feature
- [server/README.md](./server/README.md) - API documentation and server setup
- [client/README.md](./client/README.md) - Client application details
