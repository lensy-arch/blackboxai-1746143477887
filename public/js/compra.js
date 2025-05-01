const purchaseForm = document.getElementById('purchase-form');
const productListContainer = document.getElementById('product-list-container');
const addProductBtn = document.getElementById('add-product-btn');
const totalPayInput = document.getElementById('total-pay');
const amountPaidInput = document.getElementById('amount-paid');
const changeInput = document.getElementById('change');

function getInventory() {
  const products = localStorage.getItem('products');
  return products ? JSON.parse(products) : [];
}

function saveInventory(products) {
  localStorage.setItem('products', JSON.stringify(products));
}

function getPurchases() {
  const purchases = localStorage.getItem('purchases');
  return purchases ? JSON.parse(purchases) : [];
}

function savePurchases(purchases) {
  localStorage.setItem('purchases', JSON.stringify(purchases));
}

function createProductRow() {
  const inventory = getInventory();
  if (inventory.length === 0) {
    alert('No hay productos en el inventario para comprar.');
    return null;
  }

  const row = document.createElement('div');
  row.className = 'grid grid-cols-6 gap-2 items-center';

  // Product select
  const productSelect = document.createElement('select');
  productSelect.className = 'col-span-2 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500';
  inventory.forEach((product, idx) => {
    const option = document.createElement('option');
    option.value = idx;
    option.textContent = `${product.name} (Disponible: ${product.quantity}) - $${product.price.toFixed(2)}`;
    productSelect.appendChild(option);
  });

  // Quantity input
  const quantityInput = document.createElement('input');
  quantityInput.type = 'number';
  quantityInput.min = '1';
  quantityInput.value = '1';
  quantityInput.className = 'col-span-1 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500';

  // Price display (readonly)
  const priceInput = document.createElement('input');
  priceInput.type = 'number';
  priceInput.readOnly = true;
  priceInput.className = 'col-span-1 border border-gray-300 rounded px-2 py-1 bg-gray-100';

  // Total price display (readonly)
  const totalInput = document.createElement('input');
  totalInput.type = 'number';
  totalInput.readOnly = true;
  totalInput.className = 'col-span-1 border border-gray-300 rounded px-2 py-1 bg-gray-100';

  // Remove button
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'col-span-1 text-red-600 hover:text-red-800 transition';
  removeBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';

  row.appendChild(productSelect);
  row.appendChild(quantityInput);
  row.appendChild(priceInput);
  row.appendChild(totalInput);
  row.appendChild(removeBtn);

  // Initialize price and total
  function updatePriceAndTotal() {
    const selectedProduct = inventory[productSelect.value];
    const quantity = parseInt(quantityInput.value) || 1;
    priceInput.value = selectedProduct.price.toFixed(2);
    totalInput.value = (selectedProduct.price * quantity).toFixed(2);
    calculateTotalPay();
  }

  productSelect.addEventListener('change', updatePriceAndTotal);
  quantityInput.addEventListener('input', () => {
    let val = parseInt(quantityInput.value);
    if (isNaN(val) || val < 1) {
      val = 1;
      quantityInput.value = val;
    }
    updatePriceAndTotal();
  });

  removeBtn.addEventListener('click', () => {
    row.remove();
    calculateTotalPay();
  });

  updatePriceAndTotal();

  return row;
}

function calculateTotalPay() {
  let total = 0;
  productListContainer.querySelectorAll('div').forEach(row => {
    const totalInput = row.querySelector('input[readonly]:nth-child(4)');
    if (totalInput) {
      total += parseFloat(totalInput.value) || 0;
    }
  });
  totalPayInput.value = total.toFixed(2);
  calculateChange();
}

function calculateChange() {
  const amountPaid = parseFloat(amountPaidInput.value) || 0;
  const totalPay = parseFloat(totalPayInput.value) || 0;
  const change = amountPaid - totalPay;
  changeInput.value = change >= 0 ? change.toFixed(2) : '0.00';
}

addProductBtn.addEventListener('click', () => {
  const row = createProductRow();
  if (row) {
    productListContainer.appendChild(row);
    calculateTotalPay();
  }
});

amountPaidInput.addEventListener('input', calculateChange);

purchaseForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const date = document.getElementById('purchase-date').value;
  const buyerName = document.getElementById('buyer-name').value.trim();
  if (!date || !buyerName) {
    alert('Por favor, complete la fecha y el nombre del comprador.');
    return;
  }

  const products = [];
  let valid = true;
  productListContainer.querySelectorAll('div').forEach(row => {
    const productSelect = row.querySelector('select');
    const quantityInput = row.querySelector('input[type="number"]:not([readonly])');
    const priceInput = row.querySelector('input[readonly]:nth-child(3)');
    const totalInput = row.querySelector('input[readonly]:nth-child(4)');

    const productIndex = parseInt(productSelect.value);
    const quantity = parseInt(quantityInput.value);
    const price = parseFloat(priceInput.value);

    if (isNaN(quantity) || quantity < 1) {
      valid = false;
      return;
    }

    products.push({
      name: getInventory()[productIndex].name,
      quantity,
      price,
      total: parseFloat(totalInput.value)
    });
  });

  if (!valid || products.length === 0) {
    alert('Por favor, agregue productos válidos para la compra.');
    return;
  }

  const totalPay = parseFloat(totalPayInput.value);
  const amountPaid = parseFloat(amountPaidInput.value);
  if (amountPaid < totalPay) {
    alert('La cantidad pagada es insuficiente.');
    return;
  }

  // Update inventory quantities
  const inventory = getInventory();
  for (const p of products) {
    const invProduct = inventory.find(ip => ip.name === p.name);
    if (!invProduct || invProduct.quantity < p.quantity) {
      alert(`No hay suficiente inventario para el producto: ${p.name}`);
      return;
    }
  }
  for (const p of products) {
    const invProduct = inventory.find(ip => ip.name === p.name);
    invProduct.quantity -= p.quantity;
  }
  saveInventory(inventory);

  // Save purchase report
  const purchases = getPurchases();
  purchases.push({
    date,
    buyerName,
    products,
    totalPay,
    amountPaid,
    change: amountPaid - totalPay
  });
  savePurchases(purchases);

  alert('Compra registrada exitosamente.');

  // Reset form
  purchaseForm.reset();
  productListContainer.innerHTML = '';
  totalPayInput.value = '';
  changeInput.value = '';
});

// Initialize with one product row
addProductBtn.click();
