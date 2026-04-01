// Paystack Integration
// Docs: https://paystack.com/docs/payment/popup

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_YOUR_KEY_HERE';
const COMMISSION_RATE = 0.07;

/**
 * Calculate fees
 * @param {number} subtotal - Total ticket cost before fees (KES)
 * @returns {{ subtotal, commission, total }}
 */
export function calculateFees(subtotal) {
  const commission = Math.round(subtotal * COMMISSION_RATE);
  const total = subtotal + commission;
  return { subtotal, commission, total };
}

/**
 * Open Paystack popup
 * @param {Object} opts
 * @param {string} opts.email
 * @param {number} opts.amountKES  - in KES (we convert to kobo)
 * @param {string} opts.reference  - unique order ref
 * @param {string} opts.eventTitle
 * @param {Function} opts.onSuccess
 * @param {Function} opts.onClose
 */
export function openPaystack({ email, amountKES, reference, eventTitle, onSuccess, onClose }) {
  // Load Paystack script dynamically if not already loaded
  if (!window.PaystackPop) {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => _initPaystack({ email, amountKES, reference, eventTitle, onSuccess, onClose });
    document.head.appendChild(script);
    return;
  }
  _initPaystack({ email, amountKES, reference, eventTitle, onSuccess, onClose });
}

function _initPaystack({ email, amountKES, reference, eventTitle, onSuccess, onClose }) {
  const handler = window.PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email,
    amount: amountKES * 100, // Paystack uses kobo/cents
    currency: 'KES',
    ref: reference,
    metadata: {
      custom_fields: [
        { display_name: 'Event', variable_name: 'event', value: eventTitle },
      ],
    },
    callback: (response) => {
      onSuccess && onSuccess(response);
    },
    onClose: () => {
      onClose && onClose();
    },
  });
  handler.openIframe();
}

/**
 * Generate a unique order reference
 */
export function generateRef() {
  return `CT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

/**
 * Verify payment on backend (call your own API)
 * This is a placeholder — implement server-side verification
 */
export async function verifyPayment(reference) {
  // You MUST verify server-side using Paystack's secret key
  // Never verify client-side in production
  // POST to your backend: /api/verify-payment
  console.log('Verify payment reference:', reference);
  return { verified: true, reference };
}
