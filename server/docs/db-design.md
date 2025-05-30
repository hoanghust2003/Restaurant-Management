Table users {
  id UUID [pk]
  name varchar(255)
  email varchar(255) [unique]
  password varchar(255)
  avatar_url varchar(255)
  role varchar(50) [note: 'Enum: admin, manager, waiter, chef, cashier, warehouse, customer']
  created_at timestamp [default: `now()`]
  deleted_at timestamp [default: null]
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
  threshold float
  created_at timestamp [default: `now()`]
  deleted_at timestamp [default: null]
}

Table ingredient_imports {
  id UUID [pk]
  created_by UUID [ref: > users.id]
  supplier_id UUID [ref: > suppliers.id]
  created_at timestamp [default: `now()`]
  note text
  deleted_at timestamp [default: null]
}


Table suppliers {
  id UUID [pk]
  name varchar(255) [note: 'Tên nhà cung cấp']
  contact_name varchar(255) [note: 'Tên người liên hệ']
  contact_phone varchar(20) [note: 'Số điện thoại người liên hệ']
  contact_email varchar(255) [note: 'Email người liên hệ']
  address text [note: 'Địa chỉ nhà cung cấp']
  created_at timestamp [default: `now()`]
  deleted_at timestamp [default: null]
}

Table categories {
  id UUID [pk]
  name varchar(100)
  description text
  deleted_at timestamp [default: null]
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
  deleted_at timestamp [default: null]
}

Table dish_ingredients {
  id UUID [pk]
  dish_id UUID [ref: > dishes.id]
  ingredient_id UUID [ref: > ingredients.id]
  quantity float
  deleted_at timestamp [default: null]
}

Table menus {
  id UUID [pk]
  name varchar(255)
  description text
  created_at timestamp [default: `now()`]
  deleted_at timestamp [default: null]
}

Table menu_dishes {
  id UUID [pk]
  menu_id UUID [ref: > menus.id]
  dish_id UUID [ref: > dishes.id]
  deleted_at timestamp [default: null]
}

Table tables {
  id UUID [pk]
  name varchar(50)
  capacity int
  status varchar(20) [note: 'Enum: available, occupied, reserved, cleaning']
  deleted_at timestamp [default: null]
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

Table ingredient_exports {
  id UUID [pk]
  created_by UUID [ref: > users.id]
  reason text 
  created_at timestamp [default: `now()`]
  deleted_at timestamp [default: null]
}

Table export_items {
  id UUID [pk]
  export_id UUID [ref: > ingredient_exports.id]
  batch_id UUID [ref: > batches.id]
  ingredient_id UUID [ref: > ingredients.id]
  quantity float
}

Table batches {
  id UUID [pk]
  import_id UUID [ref: > ingredient_imports.id]
  ingredient_id UUID [ref: > ingredients.id]
  name varchar(250)
  quantity float
  remaining_quantity float
  expiry_date date
  price float
  deleted_at timestamp [default: null]
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
  related_import_id UUID [ref: > ingredient_imports.id, null]
  related_order_id UUID [ref: > orders.id, null]
  created_at timestamp [default: `now()`]
}
