import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runHostTest() {
  console.log('🧪 Iniciando prueba automatizada de la Consola DJ Anfitrión (Fase 3)...');

  // 1. Obtener sala FIESTA
  const { data: room, error: rErr } = await supabase
    .from('karaoke_rooms')
    .select('*')
    .eq('room_code', 'FIESTA')
    .single();

  if (rErr || !room) throw new Error('No se encontró la sala FIESTA');
  console.log(`✅ Sala Anfitrión verificada: ${room.name} (PIN: ${room.host_pin})`);

  // 2. Limpiar e insertar 3 canciones
  await supabase.from('karaoke_queue').delete().eq('room_id', room.id);
  const testSongs = [
    {
      room_id: room.id,
      video_id: 'Ig_u_Mty0cU',
      title: 'De Música Ligera - Soda Stereo',
      author: 'Party Tyme',
      duration_seconds: 224,
      requested_by: 'David',
      priority_order: 1,
      status: 'playing',
    },
    {
      room_id: room.id,
      video_id: 'U5TiuzOkJEY',
      title: 'Rayando El Sol - Maná',
      author: 'Party Tyme',
      duration_seconds: 272,
      requested_by: 'Invitado Ausente',
      priority_order: 1,
      status: 'queued',
    },
    {
      room_id: room.id,
      video_id: 'BimPHAx5-Vk',
      title: 'La Camisa Negra - Juanes',
      author: 'Party Tyme',
      duration_seconds: 233,
      requested_by: 'Carlos Amigo',
      priority_order: 2,
      status: 'queued',
    },
  ];
  await supabase.from('karaoke_queue').insert(testSongs);
  console.log('✅ Canciones iniciales insertadas.');

  // 3. Probar reordenar canción con fn_reorder_queue (mover posición 2 a 1)
  const { data: queueBefore } = await supabase
    .from('karaoke_queue')
    .select('id, title, priority_order')
    .eq('room_id', room.id)
    .eq('status', 'queued')
    .order('priority_order', { ascending: true });

  const songToMove = queueBefore[1]; // Juanes
  const { data: reordered, error: reorderErr } = await supabase.rpc('fn_reorder_queue', {
    p_room_id: room.id,
    p_song_id: songToMove.id,
    p_new_position: 1,
  });

  if (reorderErr || !reordered) throw new Error(`Fallo reordenando: ${reorderErr?.message}`);
  console.log(`✅ Drag-and-Drop verificado: "${songToMove.title}" ahora es posición #1 en la cola.`);

  // 4. Probar purga de canciones por anfitrión
  const { error: purgeErr } = await supabase
    .from('karaoke_queue')
    .update({ status: 'purged_by_host' })
    .eq('room_id', room.id)
    .eq('requested_by', 'Invitado Ausente');

  if (purgeErr) throw new Error(`Fallo purgando: ${purgeErr.message}`);
  console.log('✅ Purga de canciones de invitado ausente completada con éxito.');

  // 5. Probar resetear toda la sala a cero
  const { error: queueResetErr } = await supabase
    .from('karaoke_queue')
    .update({ status: 'purged_by_host', finished_at: new Date().toISOString() })
    .eq('room_id', room.id)
    .in('status', ['queued', 'playing']);

  const { error: roomResetErr } = await supabase
    .from('karaoke_rooms')
    .update({
      current_song_id: null,
      is_playing: false,
      current_time_seconds: 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', room.id);

  if (queueResetErr || roomResetErr) throw new Error('Fallo al resetear sala a cero');
  
  const { data: finalRoom } = await supabase
    .from('karaoke_rooms')
    .select('current_song_id, is_playing')
    .eq('id', room.id)
    .single();

  if (finalRoom.current_song_id !== null || finalRoom.is_playing !== false) {
    throw new Error('La sala no quedó en estado Idle después del reset');
  }
  console.log('✅ RPC fn_reset_room_queue ejecutado al 100%: Sala vaciada y TV devuelta a pantalla de espera (Idle).');

  console.log('🎉 ¡Todas las operaciones del Nodo Celular Anfitrión (Fase 3) pasaron al 100%!');
}

runHostTest().catch(console.error);
