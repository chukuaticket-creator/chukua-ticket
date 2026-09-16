// ─── QR helpers ──────────────────────────────────────────────────
// Both libraries load from cdnjs at runtime rather than npm. Adding a
// dependency from the GitHub web editor desyncs package-lock.json and breaks
// Netlify's `npm ci`, so this keeps the build untouched.
//
//   qrcodejs → drawing a QR         (tickets, event posters)
//   jsQR     → reading one from the camera (gate check-in)

const QR_SRC   = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
const JSQR_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.js';

function loadScript(src, globalName) {
  return new Promise((resolve, reject) => {
    if (window[globalName]) return resolve(window[globalName]);

    // A second caller while the first is still loading must not inject twice.
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window[globalName]));
      existing.addEventListener('error', reject);
      return;
    }

    const el = document.createElement('script');
    el.src = src;
    el.async = true;
    el.onload = () => resolve(window[globalName]);
    el.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.appendChild(el);
  });
}

export const loadQRWriter = () => loadScript(QR_SRC, 'QRCode');
export const loadQRReader = () => loadScript(JSQR_SRC, 'jsQR');

/**
 * Draw a QR code into an element.
 * @returns the canvas, or null if the library didn't load.
 */
export async function renderQR(el, text, size = 200) {
  if (!el || !text) return null;
  const QRCode = await loadQRWriter();
  el.innerHTML = '';
  new QRCode(el, {
    text,
    width: size,
    height: size,
    // High correction: a printed poster or a phone screen at the gate is often
    // smudged, glared or partly covered.
    correctLevel: QRCode.CorrectLevel.H,
  });
  return el.querySelector('canvas');
}

/**
 * Turn a rendered QR into a PNG download, with a caption underneath so a
 * printed poster still says what it's for.
 */
export function downloadQR(el, filename = 'qr-code.png', caption = '') {
  const canvas = el?.querySelector('canvas');
  if (!canvas) return false;

  const pad = 24;
  const captionH = caption ? 52 : 0;
  const out = document.createElement('canvas');
  out.width = canvas.width + pad * 2;
  out.height = canvas.height + pad * 2 + captionH;

  const ctx = out.getContext('2d');
  // Always white behind the code — a dark-mode screenshot won't scan.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(canvas, pad, pad);

  if (caption) {
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(caption.slice(0, 34), out.width / 2, canvas.height + pad + 26);
    ctx.fillStyle = '#FF5C00';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText('chukuaticket.com', out.width / 2, canvas.height + pad + 46);
  }

  const link = document.createElement('a');
  link.download = filename;
  link.href = out.toDataURL('image/png');
  link.click();
  return true;
}

/**
 * Start the rear camera and call onResult(text) the first time a QR is decoded.
 * Returns a stop() function — always call it, or the camera light stays on.
 */
export async function startScanner(videoEl, canvasEl, onResult, onError) {
  let stream = null;
  let raf = null;
  let stopped = false;

  const stop = () => {
    stopped = true;
    if (raf) cancelAnimationFrame(raf);
    if (stream) stream.getTracks().forEach(t => t.stop());
  };

  try {
    const jsQR = await loadQRReader();

    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }, // rear camera on phones
      audio: false,
    });

    videoEl.srcObject = stream;
    videoEl.setAttribute('playsinline', 'true'); // iOS won't go fullscreen
    await videoEl.play();

    const ctx = canvasEl.getContext('2d', { willReadFrequently: true });

    const tick = () => {
      if (stopped) return;

      if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA) {
        canvasEl.width = videoEl.videoWidth;
        canvasEl.height = videoEl.videoHeight;
        ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

        const img = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
        const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });

        if (code?.data) {
          stop();
          onResult(code.data.trim());
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
  } catch (err) {
    stop();
    const name = err?.name || '';
    onError?.(
      name === 'NotAllowedError' ? 'Camera permission was denied. Allow it in your browser settings, or type the code instead.'
      : name === 'NotFoundError' ? 'No camera found on this device.'
      : 'Could not start the camera. Type the code instead.'
    );
  }

  return stop;
}
