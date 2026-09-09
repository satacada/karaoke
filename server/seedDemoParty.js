import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDemo() {
  console.log('🎤 Cargando canciones de demostración en la sala FIESTA...');

  // 1. Obtener sala FIESTA
  const { data: room, error: roomError } = await supabase
    .from('karaoke_rooms')
    .select('*')
    .eq('room_code', 'FIESTA')
    .single();

  if (roomError || !room) {
    console.error('No se encontró la sala FIESTA:', roomError);
    return;
  }

  // 2. Limpiar cola previa de prueba
  await supabase.from('karaoke_queue').delete().eq('room_id', room.id);
  await supabase.from('karaoke_rooms').update({ current_song_id: null, is_playing: false }).eq('id', room.id);

  // 3. Insertar 3 canciones de karaoke
  const songs = [
    {
      room_id: room.id,
      video_id: 'Ig_u_Mty0cU', // Soda Stereo - De Musica Ligera (Karaoke Oficial Party Tyme)
      title: 'De Música Ligera - Soda Stereo (Karaoke)',
      author: 'Party Tyme Karaoke',
      duration_seconds: 224,
      duration_text: '3:44',
      requested_by: 'David',
      priority_order: 1,
      status: 'queued',
    },
    {
      room_id: room.id,
      video_id: 'U5TiuzOkJEY', // Mana - Rayando El Sol (Karaoke Oficial)
      title: 'Rayando El Sol - Maná (Karaoke)',
      author: 'Party Tyme Karaoke',
      duration_seconds: 272,
      duration_text: '4:32',
      requested_by: 'Ana Invitada',
      priority_order: 2,
      status: 'queued',
    },
    {
      room_id: room.id,
      video_id: 'BimPHAx5-Vk', // Juanes - La Camisa Negra (Karaoke Oficial)
      title: 'La Camisa Negra - Juanes (Karaoke)',
      author: 'Party Tyme Karaoke',
      duration_seconds: 233,
      duration_text: '3:53',
      requested_by: 'Carlos Amigo',
      priority_order: 3,
      status: 'queued',
    },
  ];

  await supabase.from('karaoke_queue').insert(songs);
  console.log('✅ 3 canciones insertadas en la cola.');

  // 4. Activar la primera canción
  const { data: playingSong } = await supabase.rpc('fn_advance_next_song', {
    p_room_id: room.id,
  });

  console.log(`🎶 ¡Reproduciendo ahora en la TV!: "${playingSong.title}" pedida por ${playingSong.requested_by}`);
  console.log('👀 Abre tu navegador en http://localhost:5173 para ver el Nodo TV en acción.');
}

seedDemo().catch(console.error);
