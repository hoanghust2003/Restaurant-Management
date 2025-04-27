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

Table suppliers {
  id UUID [pk]
  name varchar(255) [note: 'Tên nhà cung cấp']
  contact_name varchar(255) [note: 'Tên người liên hệ']
  contact_phone varchar(20) [note: 'Số điện thoại người liên hệ']
  contact_email varchar(255) [note: 'Email người liên hệ']
  address text [note: 'Địa chỉ nhà cung cấp']
  created_at timestamp [default: `now()`]
}


Table ingredient_batches {
  id UUID [pk]
  supplier_id UUID [ref: > suppliers.id]
  expiry_date date
  price float
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

Table inventory_transactions {
  id UUID [pk]
  ingredient_id UUID [ref: > ingredients.id]
  created_by UUID [ref: > users.id]
  type varchar(20) [note: 'Enum: import, export, adjust']
  quantity float
  unit varchar(50)
  related_batch_id UUID [ref: > ingredient_batches.id, null] 
  reason text 
  created_at timestamp [default: `now()`]
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

Table financial_records {
  id UUID [pk]
  type varchar(20) [note: 'Enum: income, expense']
  amount float
  description text
  created_by UUID [ref: > users.id]
  related_inventory_transaction_id UUID [ref: > inventory_transactions.id, null]
  related_order_id UUID [ref: > orders.id, null]
  created_at timestamp [default: `now()`]
}
