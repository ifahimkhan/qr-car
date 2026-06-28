import QRCode from "qrcode";

/** Render a URL to a PNG QR code buffer (high error correction, 400px). */
export async function generateQRPng(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    errorCorrectionLevel: "H",
    width: 400,
    margin: 2,
  });
}
