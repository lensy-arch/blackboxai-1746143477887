const productForm = document.getElementById('product-form');
const productList = document.getElementById('product-list');
const searchInput = document.getElementById('search-input');
const submitButton = document.getElementById('submit-button');
const cancelEditButton = document.getElementById('cancel-edit-button');

let editIndex = -1;
let products = [];

async function getProducts() {
  try {
    const response = await fetch('/api/producto');
    if (!response.ok) throw new Error('Error al obtener productos');
    products = await response.json();
    return products;
  } catch (error) {
    alert(error.message);
    return [];
  }
}

async function saveProduct(product) {
  try {
    const response = await fetch('/api/producto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!response.ok) throw new Error('Error al guardar producto');
    return await response.json();
  } catch (error) {
    alert(error.message);
  }
}

async function updateProduct(id, product) {
  try {
    const response = await fetch(`/api/producto/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!response.ok) throw new Error('Error al actualizar producto');
    return await response.json();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteProduct(id) {
  try {
    const response = await fetch(`/api/producto/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Error al eliminar producto');
    return await response.json();
  } catch (error) {
    alert(error.message);
  }
}

function renderProducts(filter = '') {
  productList.innerHTML = '';

  const filteredProducts = products.filter(p =>
    p.nombre.toLowerCase().includes(filter.toLowerCase())
  );

  if (filteredProducts.length === 0) {
    productList.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">No hay productos</td></tr>';
    return;
  }

  filteredProducts.forEach((product, index) => {
    const total = (product.cantidad * product.precio).toFixed(2);
    const tr = document.createElement('tr');
    tr.className = 'border-b hover:bg-gray-50 transition';

    tr.innerHTML = `
      <td class="px-4 py-2">${product.nombre}</td>
      <td class="px-4 py-2">
        <input type="number" min="1" value="${product.cantidad}" data-index="${index}" class="quantity-input w-20 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </td>
      <td class="px-4 py-2">Bs. ${product.precio.toFixed(2)}</td>
      <td class="px-4 py-2">Bs. ${total}</td>
      <td class="px-4 py-2 space-x-2">
        <button data-index="${index}" class="edit-btn text-blue-600 hover:text-blue-800 transition" title="Editar producto">
          <i class="fas fa-edit"></i>
        </button>
        <button data-index="${index}" class="delete-btn text-red-600 hover:text-red-800 transition" title="Eliminar producto">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;

    productList.appendChild(tr);
  });

  // Add event listeners for quantity inputs, edit buttons and delete buttons
  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', async (e) => {
      const idx = e.target.getAttribute('data-index');
      let newQuantity = parseInt(e.target.value);
      if (isNaN(newQuantity) || newQuantity < 1) {
        newQuantity = 1;
        e.target.value = 1;
      }
      const product = filteredProducts[idx];
      if (!product) return;
      product.cantidad = newQuantity;
      await updateProduct(product.id, product);
      await loadAndRenderProducts(searchInput.value);
    });
  });

  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const idx = e.target.closest('button').getAttribute('data-index');
      const product = filteredProducts[idx];
      if (!product) return;
      document.getElementById('product-name').value = product.nombre;
      document.getElementById('product-quantity').value = product.cantidad;
      document.getElementById('product-price').value = product.precio.toFixed(2);
      editIndex = products.findIndex(p => p.id === product.id);
      submitButton.textContent = 'Guardar Cambios';
      cancelEditButton.classList.remove('hidden');
    });
  });

  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      const idx = e.target.closest('button').getAttribute('data-index');
      const product = filteredProducts[idx];
      if (!product) return;
      await deleteProduct(product.id);
      await loadAndRenderProducts(searchInput.value);
      if (editIndex === products.findIndex(p => p.id === product.id)) {
        resetForm();
      }
    });
  });
}

function resetForm() {
  productForm.reset();
  document.getElementById('product-quantity').value = 1;
  document.getElementById('product-price').value = '0.00';
  editIndex = -1;
  submitButton.textContent = 'Agregar Producto';
  cancelEditButton.classList.add('hidden');
}

async function loadAndRenderProducts(filter = '') {
  await getProducts();
  renderProducts(filter);
}

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('product-name').value.trim();
  const cantidad = parseInt(document.getElementById('product-quantity').value);
  const precio = parseFloat(document.getElementById('product-price').value);

  if (!nombre || isNaN(cantidad) || cantidad < 1 || isNaN(precio) || precio < 0) {
    alert('Por favor, ingrese datos válidos.');
    return;
  }

  if (editIndex === -1) {
    // Add new product
    await saveProduct({ nombre, cantidad, precio });
  } else {
    // Update existing product
    const product = products[editIndex];
    await updateProduct(product.id, { nombre, cantidad, precio });
  }

  await loadAndRenderProducts(searchInput.value);
  resetForm();
});

searchInput.addEventListener('input', (e) => {
  renderProducts(e.target.value);
});

// Initial load and render
loadAndRenderProducts();
