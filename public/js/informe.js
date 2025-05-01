function getPurchases() {
  const purchases = localStorage.getItem('purchases');
  return purchases ? JSON.parse(purchases) : [];
}

function renderPurchases() {
  const purchases = getPurchases();
  const tbody = document.getElementById('purchase-report-body');
  tbody.innerHTML = '';

  if (purchases.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-500">No hay compras registradas</td></tr>';
    return;
  }

  purchases.forEach(purchase => {
    const tr = document.createElement('tr');
    tr.className = 'border-b hover:bg-gray-50 transition';

    const productsList = purchase.products.map(p => 
      `${p.name} (x${p.quantity}) - $${p.price.toFixed(2)}`
    ).join('<br>');

    tr.innerHTML = `
      <td class="px-4 py-2">${purchase.date}</td>
      <td class="px-4 py-2">${purchase.buyerName}</td>
      <td class="px-4 py-2">${productsList}</td>
      <td class="px-4 py-2">$${purchase.totalPay.toFixed(2)}</td>
      <td class="px-4 py-2">$${purchase.amountPaid.toFixed(2)}</td>
      <td class="px-4 py-2">$${purchase.change.toFixed(2)}</td>
    `;

    tbody.appendChild(tr);
  });
}

renderPurchases();
