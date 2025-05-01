-- SQL schema for products table

CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    price REAL NOT NULL CHECK (price >= 0)
);

-- You can use this schema to create the products table in your SQL database.
-- For SQLite, run: sqlite3 yourdatabase.db < database.sql
