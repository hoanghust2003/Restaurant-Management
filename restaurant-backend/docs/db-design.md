# Restaurant Management System - Database Design

This system is built for a restaurant to manage daily operations such as orders, dishes, tables, inventory, and more.

## Roles (Users):
- admin
- manager
- waiter
- chef
- cashier
- warehouse
- customer

## Key Features:
- Ordering and payment
- Inventory tracking (ingredients, batches, expiry date)
- Feedback from customer stored in orders
- Menu and category structure
- Sales reporting by day/week/month/quarter
- Best-selling dishes
- Possible chatbot integration for dish recommendations (future)

## Tables Overview:

- users (with role enum)
- restaurants
- ingredients (with unit as string)
- ingredient_batches
- categories
- dishes
- dish_ingredients
- menus, menu_dishes
- tables
- orders (with feedback)
- order_items

Note: ingredient units are stored directly in the ingredient table.


database dự kiến:

Table users {
  id UUID [pk]
  name varchar(255)
  email varchar(255) [unique]
  password varchar(255)
  avatar_url varchar(255)
  role varchar(50) [note: 'Enum: admin, manager, waiter, chef, cashier, warehouse, customer']
  created_at timestamp [default: `now()`]
}

Table restaurants {
  id UUID [pk]
  name varchar(255)
  address text
  phone varchar(20)
  logo_url varchar(255)
  cover_image_url varchar(255)
  created_at timestamp [default: `now()`]
}

Table ingredients {
  id UUID [pk]
  name varchar(255)
  unit varchar(50)
  current_quantity float
  threshold float
  created_at timestamp [default: `now()`]
}

Table ingredient_batches {
  id UUID [pk]
  ingredient_id UUID [ref: > ingredients.id]
  supplier_name varchar(255)
  batch_code varchar(100)
  quantity float
  expiry_date date
  imported_at timestamp [default: `now()`]
}

Table categories {
  id UUID [pk]
  name varchar(100)
  description text
}

Table dishes {
  id UUID [pk]
  name varchar(255)
  description text
  price float
  image_url varchar(255)
  is_preparable boolean [default: true]
  available boolean [default: true]
  preparation_time int
  category_id UUID [ref: > categories.id]
  created_at timestamp [default: `now()`]
}

Table dish_ingredients {
  id UUID [pk]
  dish_id UUID [ref: > dishes.id]
  ingredient_id UUID [ref: > ingredients.id]
  quantity float
}

Table menus {
  id UUID [pk]
  name varchar(255)
  description text
  created_at timestamp [default: `now()`]
}

Table menu_dishes {
  id UUID [pk]
  menu_id UUID [ref: > menus.id]
  dish_id UUID [ref: > dishes.id]
}

Table tables {
  id UUID [pk]
  name varchar(50)
  capacity int
  status varchar(20) [note: 'Enum: available, occupied, reserved, cleaning']
}

Table orders {
  id UUID [pk]
  table_id UUID [ref: > tables.id]
  user_id UUID [ref: > users.id]
  status varchar(20) [note: 'Enum: pending, in_progress, completed, canceled']
  total_price float
  feedback varchar(500)
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table order_items {
  id UUID [pk]
  order_id UUID [ref: > orders.id]
  dish_id UUID [ref: > dishes.id]
  quantity int
  note text
  status varchar(20) [note: 'Enum: waiting, preparing, done, failed']
  prepared_at timestamp
}
