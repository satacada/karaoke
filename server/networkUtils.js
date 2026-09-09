import os from 'os';
import QRCode from 'qrcode';

/**
 * Obtiene la dirección IP local de la máquina en la red local (WiFi o Ethernet)
 */
export function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Solo IPv4 y que no sea loopback (127.0.0.1)
      if (iface.family === 'IPv4' && !iface.internal) {
        // Priorizar nombres comunes de WiFi o Ethernet reales
        const lowerName = name.toLowerCase();
        const isVirtual = lowerName.includes('virtual') || 
                          lowerName.includes('vethernet') || 
                          lowerName.includes('vmware') || 
                          lowerName.includes('hyper-v') || 
                          lowerName.includes('docker') || 
                          lowerName.includes('wsl');
        
        let priority = 1;
        if (isVirtual) {
          priority = 0;
        } else if (lowerName.includes('wi-fi') || lowerName.includes('wifi') || lowerName.includes('wlan')) {
          priority = 10;
        } else if (lowerName.includes('ethernet') || lowerName.includes('eth')) {
          priority = 8;
        } else if (iface.address.startsWith('192.168.')) {
          priority = 9;
        } else {
          priority = 2;
        }

        candidates.push({
          address: iface.address,
          name,
          isVirtual,
          priority
        });
      }
    }
  }

  // Ordenar por prioridad descendente
  candidates.sort((a, b) => b.priority - a.priority);

  return candidates.length > 0 ? candidates[0].address : 'localhost';
}

/**
 * Genera un código QR en base64 para que los usuarios escaneen y se conecten
 */
export async function generateQrDataUrl(url) {
  try {
    return await QRCode.toDataURL(url, {
      width: 320,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Error generando QR code:', err);
    return null;
  }
}
