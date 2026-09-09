const QRCode = require('qrcode');
const slugs = ['asiento-copiloto', 'asiento-conductor', 'tarjeta'];
slugs.forEach(s => {
  QRCode.toFile(s + '.png', 'https://xaliscotrips.lat/r/' + s, {
    errorCorrectionLevel: 'H',
    width: 600,
    margin: 2
  }, (err) => {
    if (err) console.error('Error en ' + s + ':', err);
    else console.log('Generado: ' + s + '.png');
  });
});
