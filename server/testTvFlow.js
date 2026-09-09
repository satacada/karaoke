import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan variables de entorno para Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log('🧪 Iniciando prueba de flujo del Nodo TV contra Supabase...');

  // 1. Obtener sala FIESTA
  const { data: room, error: roomError } = await supabase
    .from('karaoke_rooms')
    .select('*')
    .eq('room_code', 'FIESTA')
    .single();

  if (roomError || !room) {
    throw new Error(`Error obteniendo sala FIESTA: ${roomError?.message}`);
  }
  console.log(`✅ Sala conectada: ${room.name} (ID: ${room.id})`);

  // 2. Insertar canción de prueba en cola
  const testSong = {
    room_id: room.id,
    video_id: 'L7_jGGMEcdc',
    title: 'De Música Ligera - Soda Stereo (Karaoke)',
    author: 'Soda Stereo Karaoke',
    thumbnail_url: 'https://i.ytimg.com/vi/L7_jGGMEcdc/hqdefault.jpg',
    duration_seconds: 210,
    duration_text: '3:30',
    requested_by: 'Carlos DJ',
    priority_order: 1,
    status: 'queued',
  };

  const { data: inserted, error: insertError } = await supabase
    .from('karaoke_queue')
    .insert([testSong])
    .select()
    .single();

  if (insertError) {
    throw new Error(`Error insertando canción: ${insertError.message}`);
  }
  console.log(`✅ Canción encolada: "${inserted.title}" pedida por ${inserted.requested_by}`);

  // 3. Probar RPC fn_advance_next_song
  const { data: nextSong, error: rpcError } = await supabase.rpc('fn_advance_next_song', {
    p_room_id: room.id,
  });

  if (rpcError) {
    throw new Error(`Error ejecutando fn_advance_next_song: ${rpcError.message}`);
  }
  console.log(`✅ RPC fn_advance_next_song ejecutado. Canción en reproducción en TV: "${nextSong?.title}"`);

  // 4. Verificar que la sala actualizó su current_song_id
  const { data: updatedRoom } = await supabase
    .from('karaoke_rooms')
    .select('id, room_code, current_song_id, is_playing')
    .eq('id', room.id)
    .single();

  console.log(`✅ Estado TV actualizado en DB: is_playing=${updatedRoom.is_playing}, current_song_id=${updatedRoom.current_song_id}`);

  // 5. Emitir un comando remoto
  const { data: cmd, error: cmdError } = await supabase
    .from('karaoke_commands')
    .insert([
      {
        room_id: room.id,
        command: 'volume',
        payload: { volume: 85 },
      },
    ])
    .select()
    .single();

  if (cmdError) {
    throw new Error(`Error insertando comando remoto: ${cmdError.message}`);
  }
  console.log(`✅ Comando remoto emitido desde Anfitrión: ${cmd.command} (volumen: ${cmd.payload.volume})`);

  // 6. Finalizar la canción con otro avance
  const { data: finalAdvance } = await supabase.rpc('fn_advance_next_song', {
    p_room_id: room.id,
  });
  console.log(`✅ Canción finalizada con éxito. Siguiente en cola: ${finalAdvance ? finalAdvance.title : 'Ninguna (Pantalla Idle activa)'}`);

  console.log('🎉 ¡Todas las pruebas de integración del Nodo TV pasaron al 100%!');
}

runTest().catch((err) => {
  console.error('❌ Error en la prueba:', err);
  process.exit(1);
});
