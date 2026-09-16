// Paystack Integration
// Docs: https://paystack.com/docs/payment/popup
//
// This file owns the Paystack popup ONLY. Fee maths lives in src/lib/api.js
// (`calcFees`) so there is exactly one source of truth — an earlier duplicate
// `calculateFees` here silently overrode the api.js version and charged the
// attendee the old ticket-price + 7%. It has been removed deliberately: if any
// file still imports it, that import will fail loudly instead of quietly
// billing the wrong amount.

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_YOUR_KEY_HERE';

/**
 * Open Paystack popup.
 *
 * Fee model: the attendee is charged the exact ticket price. The organiser's
 * 7% is taken by splitting the transaction, not by adding to the charge.
 *
 * @param {Object}   opts
 * @param {string}   opts.email
 * @param {number}   opts.amountKES       - what the attendee pays, in KES (converted to cents here)
 * @param {string}   opts.reference       - unique order ref
 * @param {string}   opts.eventTitle
 * @param {string}  [opts.subaccount]     - organiser's Paystack subaccount_code. Omit and the
 *                                          full amount lands in the main account (no split).
 * @param {number}  [opts.platformFeeKES] - Chukua Ticket's cut in KES (calcFees().commission)
 * @param {string}  [opts.bearer]         - who pays Paystack's own processing fee.
 *                                          'subaccount' (default) = the organiser, consistent
 *                                          with the organiser-pays-fees model. 'account' = us.
 * @param {Function} opts.onSuccess
 * @param {Function} opts.onClose
 */
export function openPaystack(opts) {
  if (!window.PaystackPop) {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => _initPaystack(opts);
    script.onerror = () => opts.onClose && opts.onClose();
    document.head.appendChild(script);
    return;
  }
  _initPaystack(opts);
}

function _initPaystack({
  email, amountKES, reference, eventTitle,
  subaccount, platformFeeKES = 0, bearer = 'subaccount',
  onSuccess, onClose,
}) {
  const config = {
    key: PAYSTACK_PUBLIC_KEY,
    email,
    amount: Math.round(amountKES * 100), // Paystack works in the minor unit
    currency: 'KES',
    ref: reference,
    metadata: {
      custom_fields: [
        { display_name: 'Event', variable_name: 'event', value: eventTitle },
      ],
    },
    callback: (response) => { onSuccess && onSuccess(response); },
    onClose: () => { onClose && onClose(); },
  };

  // Split payment: organiser's subaccount is settled directly by Paystack,
  // our 7% is retained in the main account. No manual transfers.
  if (subaccount) {
    config.subaccount = subaccount;
    config.bearer = bearer;
    if (platformFeeKES > 0) {
      config.transaction_charge = Math.round(platformFeeKES * 100);
    }
  }

  window.PaystackPop.setup(config).openIframe();
}

/** Generate a unique order reference */
export function generateRef() {
  return `CT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

/**
 * Payment verification MUST happen server-side with the secret key.
 * In this build that is the Supabase `verify-payment` edge function, triggered
 * by the Paystack `charge.success` webhook. Never trust a client-side result.
 */
export async function verifyPayment(reference) {
  const res = await fetch(`/api/tickets/verify/${reference}`).catch(() => null);
  if (!res || !res.ok) return { verified: false, reference };
  return res.json();
}
