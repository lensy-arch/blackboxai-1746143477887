-- Tabla de productos
CREATE TABLE inventario (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(255) NOT NULL,
quantity INT NOT NULL CHECK (cantidad >= 0),
price DECIMAL(10, 2) NOT NULL CHECK (precio >= 0)
);

- Tabla de compras
CREATE TABLE compras (
id INT AUTO_INCREMENT PRIMARY KEY,
fecha_compra DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
total DECIMAL(10, 2) NOT NULL CHECK (total >= 0)
);

-- Tabla de artículos de compra (relación de varios a uno con compras)
CREATE TABLE comprar_artículos (
id INT AUTO_INCREMENT PRIMARY KEY,
id_compra INT NOT NULL,
product_id INT NOT NULL,
cantidad INT NOT NULL CHECK (quantity > 0),
precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
FOREIGN KEY (id_compra) REFERENCES purchase(id) ON DELETE CASCADE,
FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Puede ampliar este esquema con usuarios, informes, etc., según sea necesario.

-- Notas:
-- Utilice este esquema con una base de datos MySQL o MariaDB.
-- Ajuste AUTO_INCREMENT y los tipos de datos si utiliza otras bases de datos SQL.
