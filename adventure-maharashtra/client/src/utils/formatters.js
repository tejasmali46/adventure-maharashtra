/**
 * Format currency amount in paise to Indian Rupee (INR) format
 * @param {number} amountPaise
 * @returns {string} e.g. ₹1,399
 */
export function formatPrice(amountPaise) {
  if (typeof amountPaise !== 'number' || isNaN(amountPaise)) return '₹0';
  const rupees = amountPaise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(rupees);
}

/**
 * Format date string nicely
 * @param {string|Date} date
 * @returns {string} e.g. Oct 25, 2026
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
