import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://pfhjrplnfuupftgzdnop.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testSwapsAndReplacement() {
  console.log('\n======================================================');
  console.log('🧪 TEST: REEMPLAZO DE CANCIÓN Y SWAP DE ORDEN PROPIO');
  console.log('======================================================\n');

  const testRoomCode = 'TEST' + Math.floor(Math.random() * 10000);
  const guestA = 'Juan Perez';
  const guestB = 'Maria Gomez';

  // Crear sala aislada de prueba
  const { data: testRoom } = await supabase.from('karaoke_rooms').insert([{
    room_code: testRoomCode,
    name: 'Sala Test Rockola Swaps',
    host_pin: '9999'
  }]).select().single();
  const testRoomId = testRoom.id;

  try {
    // 1. Insertar 3 canciones simulando:
    // Slot 1 (priority_order 10): Juan Perez - Canción A1
    // Slot 2 (priority_order 11): Maria Gomez - Canción B1 (otra persona en medio)
    // Slot 3 (priority_order 12): Juan Perez - Canción A2
    console.log('1️⃣ Insertando canciones de prueba con orden intercalado...');
    const { data: s1, error: e1 } = await supabase.from('karaoke_queue').insert([{
      room_id: testRoomId,
      video_id: 'vid-juan-1',
      title: 'Juan Canción 1 Original',
      author: 'Artista 1',
      duration_seconds: 180,
      duration_text: '3:00',
      requested_by: guestA,
      priority_order: 10,
      status: 'queued'
    }]).select().single();

    const { data: s2, error: e2 } = await supabase.from('karaoke_queue').insert([{
      room_id: testRoomId,
      video_id: 'vid-maria-1',
      title: 'Maria Canción 1 En Medio',
      author: 'Artista 2',
      duration_seconds: 200,
      duration_text: '3:20',
      requested_by: guestB,
      priority_order: 11,
      status: 'queued'
    }]).select().single();

    const { data: s3, error: e3 } = await supabase.from('karaoke_queue').insert([{
      room_id: testRoomId,
      video_id: 'vid-juan-2',
      title: 'Juan Canción 2 Original',
      author: 'Artista 3',
      duration_seconds: 210,
      duration_text: '3:30',
      requested_by: guestA,
      priority_order: 12,
      status: 'queued'
    }]).select().single();

    if (e1 || e2 || e3) throw new Error(`Error insertando: ${e1?.message || e2?.message || e3?.message}`);
    console.log('   ✅ Canciones iniciales insertadas:');
    console.log(`      #10: ${s1.title} (${s1.requested_by})`);
    console.log(`      #11: ${s2.title} (${s2.requested_by})`);
    console.log(`      #12: ${s3.title} (${s3.requested_by})`);

    // 2. Probar REEMPLAZO de Juan Canción 1 manteniendo el turno #10
    console.log('\n2️⃣ Probando reemplazo de canción de Juan manteniendo el orden #10...');
    const { error: repErr } = await supabase.from('karaoke_queue').update({
      video_id: 'vid-juan-1-cambiada',
      title: 'Juan Canción 1 REEMPLAZADA',
      author: 'Nuevo Artista',
      duration_seconds: 240,
      duration_text: '4:00'
    }).eq('id', s1.id).eq('status', 'queued');

    if (repErr) throw new Error(`Error en reemplazo: ${repErr.message}`);

    const { data: s1Updated } = await supabase.from('karaoke_queue').select('*').eq('id', s1.id).single();
    console.log(`   ✅ Canción reemplazada exitosamente: "${s1Updated.title}"`);
    console.log(`   ✅ Posición conservada exactamente en: #${s1Updated.priority_order}`);
    if (s1Updated.priority_order !== 10) throw new Error('Falló conservación de turno');

    // 3. Probar SWAP entre las dos canciones de Juan (#10 y #12), respetando la de María (#11)
    console.log('\n3️⃣ Probando SWAP entre las dos canciones de Juan (#10 <-> #12)...');
    const order1 = s1Updated.priority_order; // 10
    const order2 = s3.priority_order; // 12

    await supabase.from('karaoke_queue').update({ priority_order: order2 }).eq('id', s1.id);
    await supabase.from('karaoke_queue').update({ priority_order: order1 }).eq('id', s3.id);

    // Verificar nuevo estado
    const { data: qAfter } = await supabase
      .from('karaoke_queue')
      .select('id, title, requested_by, priority_order')
      .in('id', [s1.id, s2.id, s3.id])
      .order('priority_order', { ascending: true });

    console.log('   ✅ Orden resultante en la cola:');
    qAfter.forEach(item => {
      console.log(`      #${item.priority_order}: "${item.title}" (${item.requested_by})`);
    });

    const checkS3 = qAfter.find(s => s.id === s3.id);
    const checkS2 = qAfter.find(s => s.id === s2.id);
    const checkS1 = qAfter.find(s => s.id === s1.id);

    if (checkS3.priority_order !== 10) throw new Error('Canción 2 de Juan no quedó en #10');
    if (checkS2.priority_order !== 11) throw new Error('Canción de María en el medio fue alterada');
    if (checkS1.priority_order !== 12) throw new Error('Canción 1 de Juan no quedó en #12');

    console.log('\n   🎉 ¡PERFECTO! El orden de María (#11) no fue tocado y las dos de Juan se intercambiaron.');

    // 4. Limpieza
    console.log('\n4️⃣ Limpiando canciones y sala de prueba...');
    await supabase.from('karaoke_queue').delete().in('id', [s1.id, s2.id, s3.id]);
    await supabase.from('karaoke_rooms').delete().eq('id', testRoomId);
    console.log('   ✅ Limpieza completada.');

    console.log('\n======================================================');
    console.log('🎉 TODAS LAS PRUEBAS DE REEMPLAZO Y SWAP PASARON');
    console.log('======================================================\n');
  } catch (err) {
    if (testRoomId) {
      await supabase.from('karaoke_queue').delete().eq('room_id', testRoomId);
      await supabase.from('karaoke_rooms').delete().eq('id', testRoomId);
    }
    console.error('\n❌ ERROR EN TEST DE SWAPS:', err.message);
    process.exit(1);
  }
}

testSwapsAndReplacement();
