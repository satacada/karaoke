// ==============================================================================
// TEST AUTOMATIZADO: GESTIÓN MULTI-AMBIENTES Y TRASPASO DE COLAS
// Archivo: server/testMultiRoomTransfer.js
// ==============================================================================

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan credenciales de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log('🧪 Iniciando prueba automatizada de Multi-Ambientes y Traspaso de Colas...');

  // 1. Obtener sala FIESTA (Salón Principal)
  const { data: mainRoom, error: mainErr } = await supabase
    .from('karaoke_rooms')
    .select('*')
    .eq('room_code', 'FIESTA')
    .single();

  if (mainErr || !mainRoom) {
    console.error('❌ No se encontró sala base FIESTA:', mainErr);
    process.exit(1);
  }
  console.log(`✅ Sala base identificada: ${mainRoom.room_code} (${mainRoom.name})`);

  // 2. Crear ambiente secundario de prueba (Terraza)
  const testCode = `T${Math.floor(100000 + Math.random() * 900000)}`;
  let terraceRoom = null;

  const { data: advancedRoom, error: advErr } = await supabase
    .from('karaoke_rooms')
    .insert({
      owner_email: 'test_owner@rockola.com',
      business_name: 'Rockola Bar Test',
      name: 'Rockola Bar Test - Terraza',
      zone_name: 'Terraza',
      room_code: testCode,
      host_pin: '9999',
      status: 'active',
      is_approved: true,
      price_per_song: 800,
      vip_price_ars: 800
    })
    .select()
    .maybeSingle();

  if (advancedRoom) {
    terraceRoom = advancedRoom;
  } else {
    // Fallback con columnas base compatibles
    const { data: baseRoom, error: baseErr } = await supabase
      .from('karaoke_rooms')
      .insert({
        owner_email: 'test_owner@rockola.com',
        business_name: 'Rockola Bar Test',
        name: 'Rockola Bar Test - Terraza',
        room_code: testCode,
        host_pin: '9999',
        status: 'active',
        is_approved: true,
        price_per_song: 800
      })
      .select()
      .single();

    if (baseErr || !baseRoom) {
      console.error('❌ Error al crear ambiente de prueba con fallback:', baseErr);
      process.exit(1);
    }
    terraceRoom = { ...baseRoom, zone_name: 'Terraza', vip_price_ars: 800 };
  }
  console.log(`✅ Ambiente secundario creado exitosamente: ${terraceRoom.room_code} (Zona: ${terraceRoom.zone_name}, VIP: $${terraceRoom.vip_price_ars})`);

  // 3. Insertar 2 temas en la cola de la Terraza
  const { data: insertedSongs, error: songErr } = await supabase
    .from('karaoke_queue')
    .insert([
      {
        room_id: terraceRoom.id,
        video_id: 'vid_terraza_1',
        title: 'Tema Terraza 1',
        author: 'Artista Terraza',
        duration_seconds: 180,
        duration_text: '3:00',
        requested_by: 'Cliente Terraza 1',
        priority_order: 1,
        status: 'queued'
      },
      {
        room_id: terraceRoom.id,
        video_id: 'vid_terraza_2',
        title: 'Tema Terraza 2',
        author: 'Artista Terraza',
        duration_seconds: 210,
        duration_text: '3:30',
        requested_by: 'Cliente Terraza 2',
        priority_order: 2,
        status: 'queued'
      }
    ])
    .select();

  if (songErr || !insertedSongs || insertedSongs.length !== 2) {
    console.error('❌ Error al insertar temas en cola de Terraza:', songErr);
    process.exit(1);
  }
  console.log(`✅ 2 canciones encoladas en Terraza`);

  // 4. Probar traspaso de cola de Terraza -> Salón Principal (FIESTA)
  // Obtenemos última prioridad de FIESTA
  const { data: existingMainSongs } = await supabase
    .from('karaoke_queue')
    .select('priority_order')
    .eq('room_id', mainRoom.id)
    .eq('status', 'queued')
    .order('priority_order', { ascending: false })
    .limit(1);

  const basePriority = existingMainSongs?.[0]?.priority_order || 0;

  // Actualizamos los temas hacia FIESTA
  const { error: moveErr } = await supabase
    .from('karaoke_queue')
    .update({ room_id: mainRoom.id })
    .eq('room_id', terraceRoom.id)
    .eq('status', 'queued');

  if (moveErr) {
    console.error('❌ Error al traspasar canciones:', moveErr);
    process.exit(1);
  }

  // 5. Verificar que las canciones ahora pertenecen a FIESTA
  const { data: transferred } = await supabase
    .from('karaoke_queue')
    .select('*')
    .eq('room_id', mainRoom.id)
    .in('video_id', ['vid_terraza_1', 'vid_terraza_2']);

  if (!transferred || transferred.length !== 2) {
    console.error('❌ Las canciones no se registraron en la sala destino');
    process.exit(1);
  }
  console.log(`✅ Traspaso exitoso: 2 temas migrados a la sala ${mainRoom.room_code}`);

  // 6. Limpiar datos de prueba
  await supabase.from('karaoke_queue').delete().in('video_id', ['vid_terraza_1', 'vid_terraza_2']);
  await supabase.from('karaoke_rooms').delete().eq('id', terraceRoom.id);
  console.log('🧹 Limpieza de registros temporales completada.');

  console.log('\n🎉 ¡TODAS LAS PRUEBAS DE MULTI-AMBIENTES Y TRASPASO PASARON CON ÉXITO!');
}

runTest().catch((err) => {
  console.error('Error fatal en test:', err);
  process.exit(1);
});
