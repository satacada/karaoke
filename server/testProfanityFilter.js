// ==============================================================================
// TEST UNITARIO: FILTRO ANTI-OFENSIVO PARA DEDICATORIAS
// Archivo: server/testProfanityFilter.js
// ==============================================================================

import { validateDedication } from '../client/src/utils/profanityFilter.ts';

console.log('\n======================================================');
console.log('🧪 TEST: FILTRO ANTI-OFENSIVO DE DEDICATORIAS');
console.log('======================================================\n');

const validCases = [
  '¡Feliz cumple Valentina! De la mesa 4 🎂',
  'Para todos los amigos de la barra, salud! 🍻',
  'Dedicada a mi amor con cariño ❤️',
  'Vamos a cantar con todo esta noche 🎤',
  '',
  '   ',
];

const invalidCases = [
  'Eres un puto imbécil',
  'Vete a la mierda pedazo de hdp',
  'Para el pelotudo de la mesa 2',
  'Chupalo aweonao ctm',
  'P@t0 de m1erd@',
  'Esta es una dedicatoria que tiene mas de setenta caracteres de largo porque me gusta escribir parrafos larguisimos que no entran en la tele',
];

let passed = 0;

console.log('1️⃣ Evaluando dedicatorias válidas...');
for (const text of validCases) {
  const res = validateDedication(text);
  if (!res.isValid) {
    console.error(`❌ Falló como inválida una frase limpia: "${text}" -> ${res.errorReason}`);
    process.exit(1);
  }
  passed++;
}
console.log(`   ✅ ${validCases.length} frases limpias aprobadas correctamente.`);

console.log('\n2️⃣ Evaluando dedicatorias ofensivas o excesivas...');
for (const text of invalidCases) {
  const res = validateDedication(text);
  if (res.isValid) {
    console.error(`❌ Dejó pasar una frase prohibida: "${text}"`);
    process.exit(1);
  }
  console.log(`   🛡️ Bloqueada: "${text.slice(0, 35)}..." -> Motivo: ${res.errorReason}`);
  passed++;
}

console.log('\n======================================================');
console.log(`🎉 TODAS LAS PRUEBAS DEL FILTRO ANTI-OFENSIVO PASARON (${passed}/${validCases.length + invalidCases.length})`);
console.log('======================================================\n');
