import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://pfhjrplnfuupftgzdnop.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function encodeSongThumbnail(originalUrl, meta) {
  if (!originalUrl && !meta.dedication && !meta.isVip) return null;
  const baseUrl = originalUrl || 'https://i.ytimg.com/vi/default/hqdefault.jpg';
  const params = new URLSearchParams();
  if (meta.dedication && meta.dedication.trim()) params.set('d', meta.dedication.trim());
  if (meta.isVip) params.set('vip', '1');
  const query = params.toString();
  return query ? `${baseUrl}#${query}` : baseUrl;
}

function parseSongMeta(song) {
  let dedication = song.dedication || null;
  let isVip = Boolean(song.is_vip);
  let cleanThumbnail = song.thumbnail_url;
  if (song.thumbnail_url && song.thumbnail_url.includes('#')) {
    const [url, hash] = song.thumbnail_url.split('#');
    cleanThumbnail = url;
    try {
      const params = new URLSearchParams(hash);
      if (!dedication && params.has('d')) dedication = params.get('d');
      if (!isVip && params.get('vip') === '1') isVip = true;
    } catch {}
  }
  return { dedication, isVip, cleanThumbnail };
}

async function runTest() {
  console.log('======================================================');
  console.log('TEST: INSERCION VIP Y DEDICATORIAS EN COLA');
  console.log('======================================================\n');

  const testRoomCode = 'TEST' + Math.floor(Math.random() * 10000);
  const { data: testRoom, error: rErr } = await supabase.from('karaoke_rooms').insert([{
    room_code: testRoomCode,
    name: 'Sala Test VIP',
    host_pin: '9999'
  }]).select().single();

  if (rErr || !testRoom) {
    console.error('Error creando sala:', rErr);
    process.exit(1);
  }
  const testRoomId = testRoom.id;

  try {
    console.log('1. Insertando 3 canciones normales...');
    const baseOrder = 500;
    const { data: s1, error: e1 } = await supabase.from('karaoke_queue').insert([{
      room_id: testRoomId, video_id: 'test_video_1', title: 'Test Normal 1', author: 'Artista 1',
      duration_seconds: 180, duration_text: '3:00', requested_by: 'Carlos',
      priority_order: baseOrder, status: 'queued',
    }]).select().single();
    if (e1) throw e1;

    const { data: s2, error: e2 } = await supabase.from('karaoke_queue').insert([{
      room_id: testRoomId, video_id: 'test_video_2', title: 'Test Normal 2', author: 'Artista 2',
      duration_seconds: 180, duration_text: '3:00', requested_by: 'Ana',
      priority_order: baseOrder + 1, status: 'queued',
    }]).select().single();
    if (e2) throw e2;

    const { data: s3, error: e3 } = await supabase.from('karaoke_queue').insert([{
      room_id: testRoomId, video_id: 'test_video_3', title: 'Test Normal 3', author: 'Artista 3',
      duration_seconds: 180, duration_text: '3:00', requested_by: 'Beto',
      priority_order: baseOrder + 2, status: 'queued',
    }]).select().single();
    if (e3) throw e3;

    const testIds = [s1.id, s2.id, s3.id];
    console.log(`   OK Canciones base insertadas: #${baseOrder}, #${baseOrder+1}, #${baseOrder+2}`);

    console.log('\n2. Insertando cancion VIP con dedicatoria...');
    const dedicationText = 'Feliz cumple Sofia! Mesa 4';
    const targetPriority = baseOrder;

    await supabase.from('karaoke_queue').update({ priority_order: baseOrder + 3 }).eq('id', s3.id);
    await supabase.from('karaoke_queue').update({ priority_order: baseOrder + 2 }).eq('id', s2.id);
    await supabase.from('karaoke_queue').update({ priority_order: baseOrder + 1 }).eq('id', s1.id);

    const encodedThumb = encodeSongThumbnail('https://i.ytimg.com/vi/test1234/hqdefault.jpg', {
      dedication: dedicationText,
      isVip: true,
    });

    const { data: vipSong, error: ev } = await supabase.from('karaoke_queue').insert([{
      room_id: testRoomId, video_id: 'test_video_vip', title: 'Test VIP Cancion Estelar', author: 'Artista VIP',
      thumbnail_url: encodedThumb, duration_seconds: 210, duration_text: '3:30',
      requested_by: 'Pedro VIP', priority_order: targetPriority, status: 'queued',
    }]).select().single();
    if (ev) throw ev;

    testIds.push(vipSong.id);
    console.log(`   OK Cancion VIP insertada con orden: #${vipSong.priority_order}`);

    console.log('\n3. Verificando orden resultante...');
    const { data: list } = await supabase.from('karaoke_queue')
      .select('*')
      .in('id', testIds)
      .order('priority_order', { ascending: true });

    list.forEach(item => {
      const meta = parseSongMeta(item);
      console.log(`      #${item.priority_order}: "${item.title}" [VIP: ${meta.isVip ? 'SI' : 'NO'}] [Dedicatoria: "${meta.dedication || 'Ninguna'}"]`);
    });

    if (list[0].id !== vipSong.id) {
      throw new Error('La cancion VIP no quedo en la primera posicion.');
    }

    console.log('\n4. Verificando parseo de metadatos (songMeta)...');
    const parsed = parseSongMeta(vipSong);
    if (!parsed.isVip) throw new Error('El flag isVip no fue detectado correctamente.');
    if (parsed.dedication !== dedicationText) throw new Error('Dedicatoria incorrecta.');
    if (parsed.cleanThumbnail !== 'https://i.ytimg.com/vi/test1234/hqdefault.jpg') {
      throw new Error('cleanThumbnail no removio los query params de hash.');
    }
    console.log('   OK Flag VIP detectado.');
    console.log(`   OK Dedicatoria verificada: "${parsed.dedication}"`);
    console.log(`   OK Thumbnail limpio: ${parsed.cleanThumbnail}`);
  } finally {
    console.log('\n5. Limpiando sala y canciones de prueba...');
    await supabase.from('karaoke_queue').delete().eq('room_id', testRoomId);
    await supabase.from('karaoke_rooms').delete().eq('id', testRoomId);
    console.log('   OK Limpieza completada.');
  }

  console.log('\n======================================================');
  console.log('TODAS LAS PRUEBAS DE COLA VIP Y DEDICATORIAS PASARON');
  console.log('======================================================');
}

runTest().catch(err => {
  console.error('\nERROR:', err.message);
  process.exit(1);
});
