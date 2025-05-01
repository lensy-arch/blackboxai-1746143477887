-- Esquema SQL en español para la aplicación

-- Tabla producto
CREATE TABLE producto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad >= 0),
    precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0)
);

-- Tabla compra
CREATE TABLE compra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_compra DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0)
);

-- Tabla compra_articulos (artículos de compra)
CREATE TABLE compra_articulos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    compra_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
    FOREIGN KEY (compra_id) REFERENCES compra(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES producto(id)
);

-- Tabla informe (reportes)
CREATE TABLE informe (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Notas:
-- Este esquema está diseñado para bases de datos MySQL o MariaDB.
-- Ajusta AUTO_INCREMENT y tipos de datos si usas otra base de datos SQL.
