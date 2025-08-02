# Restaurant QR Ordering System - Product Requirements Document

## 1. Executive Summary

### 1.1 Product Vision
A comprehensive web-based ordering system that enables restaurant customers to scan QR codes at tables to browse menus, place orders, and track order status, while providing restaurant staff with an integrated order management and menu administration platform.

### 1.2 Business Objectives
- Reduce wait times for order taking
- Minimize human error in order processing
- Improve customer experience through self-service ordering
- Streamline kitchen operations and order tracking
- Provide detailed sales analytics and reporting

### 1.3 Success Metrics
- Order processing time reduction by 40%
- Customer satisfaction score > 4.5/5
- Order accuracy improvement to 98%+
- Staff efficiency increase by 30%

## 2. Product Overview

### 2.1 Target Users
- **Primary**: Walk-in restaurant customers
- **Secondary**: Restaurant kitchen staff, waiters, cashiers
- **Tertiary**: Restaurant managers and administrators

### 2.2 Core Features
1. QR code-based table identification and menu access
2. Interactive menu browsing with customizable options
3. Real-time order management system
4. Multi-role staff interface for order processing
5. Comprehensive menu management system
6. Order history and analytics

## 3. Functional Requirements

### 3.1 Customer Interface

#### 3.1.1 QR Code Scanning & Table Identification
- **REQ-001**: System shall decode QR codes containing table number and restaurant ID
- **REQ-002**: QR code format: `https://[domain]/menu/[restaurant-id]/[table-number]`
- **REQ-003**: System shall validate table number exists and is active
- **REQ-004**: System shall display table number confirmation to customer

#### 3.1.2 Menu Display
- **REQ-005**: System shall load and display restaurant menu filtered to active items only
- **REQ-006**: Menu items shall be organized by categories (Appetizers, Main Course, Beverages, Desserts, etc.)
- **REQ-007**: Each menu item shall display: name, description, base price, image
- **REQ-008**: System shall indicate when items are temporarily unavailable
- **REQ-009**: Menu shall be mobile-responsive and touch-friendly

#### 3.1.3 Item Selection & Customization
- **REQ-010**: Customer shall be able to select menu items to view detailed options
- **REQ-011**: System shall display all available options for selected item:
  - Size options with price variations (Small +$0, Medium +$2, Large +$4)
  - Preparation options with no price change (with/without sugar, spice level)
  - Add-on options with additional costs (extra cheese +$1, bacon +$3)
- **REQ-012**: System shall calculate and display real-time price based on selected options
- **REQ-013**: Customer shall be able to set quantity (1-10) for each item
- **REQ-014**: Customer shall be able to add special remarks/instructions (max 200 characters)
- **REQ-015**: System shall validate required option selections before allowing "Add to Order"

#### 3.1.4 Shopping Cart Management
- **REQ-016**: System shall maintain shopping cart throughout session
- **REQ-017**: Cart shall display: item name, options selected, quantity, individual price, subtotal
- **REQ-018**: Customer shall be able to modify quantities in cart
- **REQ-019**: Customer shall be able to remove items from cart
- **REQ-020**: System shall calculate and display order subtotal, taxes, and total amount

#### 3.1.5 Order Checkout & Confirmation
- **REQ-021**: Checkout shall display complete order summary with all details
- **REQ-022**: System shall show estimated preparation time (optional)
- **REQ-023**: System shall require order confirmation before submission
- **REQ-024**: Upon confirmation, system shall generate unique order number
- **REQ-025**: Customer shall receive order confirmation with order number and table number

#### 3.1.6 Order History & Tracking
- **REQ-026**: System shall provide order status tracking (New → In Progress → Ready → Served)
- **REQ-027**: Order history shall be accessible via bookmark/saved link
- **REQ-029**: System shall display order timestamps and current status

### 3.2 Kitchen/Staff Interface

#### 3.2.1 Order Management Dashboard
- **REQ-030**: System shall display real-time list of all active orders
- **REQ-031**: Orders shall be sorted by timestamp (oldest first)
- **REQ-032**: Each order shall display: table number, order number, timestamp, current status
- **REQ-033**: Interface shall be optimized for touch screen operation
- **REQ-034**: System shall auto-refresh order list every 30 seconds

#### 3.2.2 Order Processing Workflow
- **REQ-035**: New orders shall appear with status "New" highlighted in distinct color
- **REQ-036**: Staff shall be able to change order status to "In Progress" when cooking begins
- **REQ-037**: Each menu item within order shall have individual completion checkbox
- **REQ-038**: System shall automatically change order status to "Ready" when all items checked
- **REQ-039**: Staff shall manually change status to "Served" after delivery to table

#### 3.2.3 Order Details View
- **REQ-040**: Staff shall be able to view complete order details including:
  - All menu items with quantities
  - Selected options and customizations
  - Special remarks/instructions
  - Customer table number
  - Order total amount
- **REQ-041**: Critical information (allergies, special instructions) shall be highlighted

#### 3.2.4 Billing & Payment Management
- **REQ-042**: Cashier shall be able to generate and print bills for "Served" orders
- **REQ-043**: Bill shall include:
  - Restaurant name and contact information
  - Order details with itemized pricing
  - Total amount breakdown (subtotal, tax, total)
  - Payment instructions (cash, card, online transfer)
  - Mobile number for payment receipt submission
  - Bank account details for online transfer
- **REQ-044**: Cashier shall be able to mark orders as "Paid" after payment confirmation
- **REQ-045**: System shall record payment timestamp and method

### 3.3 Restaurant Management Interface

#### 3.3.1 Menu Management
- **REQ-046**: Manager shall be able to perform full CRUD operations on menu categories
- **REQ-047**: Manager shall be able to perform full CRUD operations on menu items
- **REQ-048**: Menu item management shall include:
  - Name, description, base price
  - Category assignment
  - Image upload (optional)
  - Availability status (active/inactive)
- **REQ-049**: Manager shall be able to manage item options:
  - Option groups (Size, Preparation, Add-ons)
  - Individual options with price modifiers
  - Required vs. optional option groups
- **REQ-050**: System shall prevent deletion of items/options currently in active orders

#### 3.3.2 Restaurant Configuration
- **REQ-051**: Manager shall configure restaurant details:
  - Restaurant name and description
  - Restaurant logo
  - Contact information
  - Operating hours
  - Tax rates
  - Payment methods and account details
- **REQ-052**: Manager shall manage table configuration:
  - Add/remove tables
  - Generate QR codes for tables
  - Enable/disable tables temporarily

#### 3.3.3 Analytics & Reporting
- **REQ-053**: System shall provide sales analytics dashboard
- **REQ-054**: Manager shall access reports for:
  - Daily/weekly/monthly sales summaries
  - Popular menu items analysis
  - Order completion times
  - Table utilization statistics
  - Revenue trends

## 4. Non-Functional Requirements

### 4.1 Performance Requirements
- **REQ-055**: Menu loading time shall not exceed 3 seconds
- **REQ-056**: Order submission shall complete within 2 seconds
- **REQ-057**: System shall support concurrent usage by 50+ customers
- **REQ-058**: Kitchen dashboard shall update with new orders within 5 seconds

### 4.2 Usability Requirements
- **REQ-059**: Customer interface shall be intuitive for users without technical training
- **REQ-060**: System shall work on mobile devices (iOS/Android browsers)
- **REQ-061**: Text shall be readable without zooming on mobile devices
- **REQ-062**: Touch targets shall be minimum 44px for mobile interaction

### 4.3 Security Requirements
- **REQ-063**: System shall validate all user inputs to prevent injection attacks
- **REQ-064**: Admin interface shall require secure authentication
- **REQ-065**: Order data shall be transmitted over HTTPS
- **REQ-066**: System shall implement session management for customer orders

### 4.4 Reliability Requirements
- **REQ-067**: System uptime shall be 99.5% during operating hours
- **REQ-068**: System shall gracefully handle network connectivity issues
- **REQ-069**: Order data shall be persistently stored and not lost on system restart

## 5. User Stories

### 5.1 Customer Stories
- **US-001**: As a customer, I want to scan a QR code at my table to instantly access the restaurant's menu
- **US-002**: As a customer, I want to customize my order with size, preparation options, and special instructions
- **US-003**: As a customer, I want to see the real-time price as I customize my order
- **US-004**: As a customer, I want to review my complete order before confirming
- **US-005**: As a customer, I want to track the status of my order after placing it

### 5.2 Staff Stories
- **US-006**: As kitchen staff, I want to see new orders immediately when they're placed
- **US-007**: As a cook, I want to mark individual items as completed as I finish preparing them
- **US-008**: As a waiter, I want to update order status when I serve food to tables
- **US-009**: As a cashier, I want to generate bills and mark orders as paid after receiving payment

### 5.3 Manager Stories
- **US-010**: As a manager, I want to easily add new menu items and set their options
- **US-011**: As a manager, I want to temporarily disable menu items when ingredients are unavailable
- **US-012**: As a manager, I want to view sales reports to understand business performance

## 6. Technical Specifications

### 6.1 System Architecture
- **Frontend**: Responsive web application (HTML5, CSS3, JavaScript)
- **Backend**: Node.js with Express.js framework
- **Database**: supabase (postgres SQL)
- **Image**: Imageki
- **Real-time Updates**: WebSocket connections for order updates
- **QR Code**: Standard QR code format with URL encoding

### 6.2 Database Schema Requirements

#### 6.2.1 Core Entities
- **Restaurants**: id, name, description, contact_info, settings, created_at
- **Tables**: id, restaurant_id, table_number, is_active, qr_code_data
- **Categories**: id, restaurant_id, name, display_order, is_active
- **MenuItems**: id, category_id, name, description, base_price, image_url, prep_time, is_active
- **ItemOptions**: id, menu_item_id, option_group, option_name, price_modifier, is_required
- **Orders**: id, restaurant_id, table_id, order_number, status, total_amount, created_at, payment_status
- **OrderItems**: id, order_id, menu_item_id, quantity, unit_price, special_instructions
- **OrderItemOptions**: id, order_item_id, option_group, option_name, price_modifier

#### 6.2.2 Status Enums
- **Order Status**: 'new', 'in_progress', 'ready', 'served', 'paid'
- **Payment Status**: 'pending', 'paid', 'refunded'

### 6.3 API Requirements

#### 6.3.1 Customer API Endpoints
- `GET /api/menu/:restaurant_id/:table_number` - Load menu for table
- `POST /api/orders` - Submit new order
- `GET /api/orders/:order_id/status` - Get order status
- `GET /api/orders/history/:session_id` - Get order history

#### 6.3.2 Staff API Endpoints
- `GET /api/staff/orders` - Get active orders list
- `PUT /api/staff/orders/:order_id/status` - Update order status
- `PUT /api/staff/orders/:order_id/items/:item_id/complete` - Mark item complete
- `POST /api/staff/orders/:order_id/bill` - Generate bill
- `PUT /api/staff/orders/:order_id/payment` - Mark as paid

#### 6.3.3 Management API Endpoints
- `GET/POST/PUT/DELETE /api/admin/menu/*` - Menu management
- `GET/POST/PUT/DELETE /api/admin/tables/*` - Table management
- `GET /api/admin/analytics/*` - Analytics and reporting

## 7. Implementation Phases

### Phase 1: Core Customer Ordering (MVP)
- QR code scanning and table identification
- Basic menu display
- Item selection with simple options
- Order submission and confirmation
- Basic order management interface

### Phase 2: Enhanced Features
- Complex menu options with price variations
- Shopping cart management
- Order status tracking
- Bill generation and payment marking

### Phase 3: Management & Analytics
- Complete menu management system
- Table configuration
- Sales analytics and reporting
- Advanced order management features

### Phase 4: Optimization & Polish
- Performance optimization
- Enhanced UI/UX
- Advanced analytics
- Mobile app considerations

## 8. Acceptance Criteria

### 8.1 Customer Experience
- Customer can successfully scan QR code and access menu within 5 seconds
- Customer can place order with customizations and receive confirmation
- Customer can track order status in real-time
- Order accuracy matches customer selections 100%

### 8.2 Staff Operations
- New orders appear on kitchen display within 5 seconds of submission
- Staff can process orders efficiently using touch interface
- Bill generation includes all required information
- Order status updates reflect accurately across all interfaces

### 8.3 Management Functions
- Manager can add/modify menu items without technical assistance
- System provides accurate sales reporting
- Menu changes reflect immediately in customer interface

## 9. Constraints & Assumptions

### 9.1 Technical Constraints
- Must work on standard web browsers (Chrome, Safari, Firefox)
- Must function on mobile devices without app installation
- Must handle intermittent internet connectivity gracefully

### 9.2 Business Constraints
- System must comply with local tax and payment regulations
- Must integrate with existing POS systems (future consideration)
- Must support multiple languages (future enhancement)

### 9.3 Assumptions
- Restaurant has reliable internet connection
- Staff have basic technical literacy for touch screen operation
- Customers have smartphones capable of scanning QR codes
- Restaurant has tablets/computers for kitchen display

## 10. Risk Assessment

### 10.1 Technical Risks
- **High**: Real-time order synchronization failures
- **Medium**: Mobile compatibility issues across devices
- **Low**: QR code scanning reliability

### 10.2 Business Risks
- **High**: Staff adoption and training requirements
- **Medium**: Customer acceptance of self-service ordering
- **Low**: Integration with existing restaurant workflows

### 10.3 Mitigation Strategies
- Implement robust error handling and offline capabilities
- Provide comprehensive staff training materials
- Design fallback procedures for system downtime
- Conduct thorough testing across multiple devices and browsers

---

**Document Version**: 1.0  
**Last Updated**: August 1, 2025  
**Prepared By**: System Analyst  
**Review Status**: Ready for Development
