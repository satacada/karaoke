import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { searchYouTubeVideos } from './searchService.js';
import { calculateWaitTimeAndPosition } from './queueLogic.js';

dotenv.config({ path: '../.env' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://pfhjrplnfuupftgzdnop.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
  console.error('❌ Falta VITE_SUPABASE_ANON_KEY en .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runGuestFlowTest() {
  console.log('\n======================================================');
  console.log('🧪 PRUEBA AUTOMATIZADA: FLUJO PWA INVITADOS (FASE 4)');
  console.log('======================================================\n');

  try {
    // 1. Probar motor de búsqueda con filtros
    console.log('1️⃣ Probando motor de búsqueda con filtro Karaoke...');
    const karaokeResults = await searchYouTubeVideos('Despacito', 'karaoke');
    if (!karaokeResults || karaokeResults.length === 0) {
      throw new Error('La búsqueda karaoke no devolvió resultados');
    }
    console.log(`   ✅ Resultados Karaoke: ${karaokeResults.length} encontrados (Primero: "${karaokeResults[0].title}")`);

    console.log('\n2️⃣ Probando motor de búsqueda con filtro Video Oficial (Rockola)...');
    const officialResults = await searchYouTubeVideos('Queen Bohemian Rhapsody', 'official');
    if (!officialResults || officialResults.length === 0) {
      throw new Error('La búsqueda oficial no devolvió resultados');
    }
    console.log(`   ✅ Resultados Oficiales: ${officialResults.length} encontrados (Primero: "${officialResults[0].title}", Tag: ${officialResults[0].versionType})`);

    // 2. Obtener sala de prueba
    console.log('\n3️⃣ Conectando a sala FIESTA en Supabase...');
    const { data: room, error: roomErr } = await supabase
      .from('karaoke_rooms')
      .select('*')
      .eq('room_code', 'FIESTA')
      .single();

    if (roomErr || !room) {
      throw new Error(`Error obteniendo sala FIESTA: ${roomErr?.message}`);
    }
    console.log(`   ✅ Conectado a sala: ${room.name} (ID: ${room.id})`);

    // 3. Registrar invitado
    const testGuestToken = `test-guest-${Date.now()}`;
    const testGuestName = 'Invitado Bot 4G';

    console.log('\n4️⃣ Registrando invitado en karaoke_guests...');
    const { data: guest, error: guestErr } = await supabase
      .from('karaoke_guests')
      .insert([
        {
          room_id: room.id,
          session_token: testGuestToken,
          guest_name: testGuestName,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (guestErr || !guest) {
      throw new Error(`Error registrando invitado: ${guestErr?.message}`);
    }
    console.log(`   ✅ Invitado registrado: ${guest.guest_name} (ID: ${guest.id})`);

    // 4. Agregar canción a la cola
    console.log('\n5️⃣ Agregando canción a la cola como invitado...');
    const pickedVideo = karaokeResults[0];
    const { data: queueItem, error: queueErr } = await supabase
      .from('karaoke_queue')
      .insert([
        {
          room_id: room.id,
          guest_id: guest.id,
          video_id: pickedVideo.videoId,
          title: pickedVideo.title,
          author: pickedVideo.author,
          thumbnail_url: pickedVideo.thumbnail,
          duration_seconds: pickedVideo.durationSeconds,
          duration_text: pickedVideo.durationText,
          requested_by: testGuestName,
          priority_order: 999,
          status: 'queued',
        },
      ])
      .select()
      .single();

    if (queueErr || !queueItem) {
      throw new Error(`Error agregando canción a la cola: ${queueErr?.message}`);
    }
    console.log(`   ✅ Canción añadida: "${queueItem.title}" solicitada por ${queueItem.requested_by}`);

    // 5. Verificar cálculo de turno
    console.log('\n6️⃣ Verificando cálculo de turno y espera estimada...');
    const dummyQueue = [queueItem];
    const turnStatus = calculateWaitTimeAndPosition(
      dummyQueue,
      null,
      { currentTime: 0, duration: 0, isPlaying: false },
      testGuestName,
      testGuestToken
    );
    console.log(`   ✅ Turno calculado: tieneCanciones=${turnStatus.hasSongsInQueue}, cancionesAdelante=${turnStatus.songsAhead}, esperaMinutos=${turnStatus.estimatedWaitMinutes}`);

    // 6. Cancelar canción como invitado
    console.log('\n7️⃣ Cancelando canción como invitado (status: cancelled_by_guest)...');
    const { error: cancelErr } = await supabase
      .from('karaoke_queue')
      .update({
        status: 'cancelled_by_guest',
        finished_at: new Date().toISOString(),
      })
      .eq('id', queueItem.id);

    if (cancelErr) {
      throw new Error(`Error cancelando canción: ${cancelErr.message}`);
    }
    console.log('   ✅ Canción cancelada correctamente');

    // 7. Limpiar invitado de prueba
    await supabase.from('karaoke_guests').delete().eq('id', guest.id);
    await supabase.from('karaoke_queue').delete().eq('id', queueItem.id);

    console.log('\n======================================================');
    console.log('🎉 TODAS LAS PRUEBAS DE LA FASE 4 PASARON AL 100%');
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n❌ ERROR EN PRUEBA DE FLUJO DE INVITADOS:', error.message);
    process.exit(1);
  }
}

runGuestFlowTest();
