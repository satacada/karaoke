import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function sendCommand() {
  const args = process.argv.slice(2);
  const commandType = args[0] || 'skip';
  const param = args[1];

  const { data: room } = await supabase
    .from('karaoke_rooms')
    .select('id, room_code')
    .eq('room_code', 'FIESTA')
    .single();

  if (!room) {
    console.error('No se encontró la sala FIESTA');
    return;
  }

  const payload = {};
  if (commandType === 'volume') {
    payload.volume = parseInt(param || '50', 10);
  } else if (commandType === 'seek') {
    payload.seconds = parseInt(param || '30', 10);
  }

  const { data, error } = await supabase
    .from('karaoke_commands')
    .insert([
      {
        room_id: room.id,
        command: commandType,
        payload,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error enviando comando:', error.message);
    return;
  }

  console.log(`📡 Comando remoto enviado a la TV: [${data.command}]`, data.payload);
}

sendCommand().catch(console.error);
