const CryptoJS = require('crypto-js');

const decryptSaavnUrl = (encryptedStr) => {
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedStr) },
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    let decoded = decrypted.toString(CryptoJS.enc.Utf8);
    decoded = decoded.replace(/\.mp4.*/, '.mp4').replace(/\.m4a.*/, '.m4a');
    return decoded.replace('http:', 'https:');
  } catch (e) {
    console.error('Saavn Decryption Error:', e);
    return '';
  }
};

const testUrl = "O00a120jEDsBf2iJkC9tP7Lw7aK4Z+6o20Vv1qW6X2jL/dK1c1x1O5QWZ/zZ/zZ/zZ/zZ/zZ/zZ/z"; // Dummy or real
console.log(decryptSaavnUrl("Lg/3Hj+z/k2x/h4bUq+TjF2U/oW7sX0z")); // Some short b64
