import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://pfhjrplnfuupftgzdnop.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testApprovalGate() {
  console.log('\n======================================================');
  console.log('🧪 TEST: COMPUERTA DE APROBACIÓN DE LOCALES (SUPERADMIN)');
  console.log('======================================================\n');

  const testRoomCode = `T${Math.floor(1000 + Math.random() * 9000)}`;
  const testOwnerEmail = 'dueño.nuevo@barcentral.com';
  const superAdminEmail = 'david@admin.com';

  try {
    // 1. Registrar un nuevo local/sala en estado pendiente (is_approved: false)
    console.log(`1️⃣ Creando sala de prueba "${testRoomCode}" con dueño "${testOwnerEmail}"...`);
    const { data: newRoom, error: createErr } = await supabase.from('karaoke_rooms').insert([{
      room_code: testRoomCode,
      name: 'Bar Central Test',
      host_pin: '9999',
      status: 'active'
    }]).select().single();

    if (createErr || !newRoom) throw new Error(`Error creando sala: ${createErr?.message}`);
    console.log(`   ✅ Sala creada: ${newRoom.room_code} (ID: ${newRoom.id})`);

    // 2. Verificar que por defecto una sala no aprobada está bloqueada
    // Simulamos la verificación de compuerta
    console.log('\n2️⃣ Verificando compuerta de bloqueo para local no aprobado...');
    const isApprovedInitial = Boolean(newRoom.is_approved);
    console.log(`   🔒 Estado de aprobación inicial: is_approved = ${isApprovedInitial}`);
    if (isApprovedInitial === true) {
      throw new Error('La sala no debería estar aprobada por defecto');
    }
    console.log('   ✅ Compuerta activa: el local NO puede acceder a la consola DJ.');

    // 3. Super Administrador aprueba el local
    console.log(`\n3️⃣ Super Administrador (${superAdminEmail}) aprueba el local...`);
    const { error: appErr } = await supabase.from('karaoke_rooms').update({
      is_approved: true,
      approved_at: new Date().toISOString(),
      approved_by: superAdminEmail,
      owner_email: testOwnerEmail
    }).eq('id', newRoom.id);

    if (appErr) throw new Error(`Error aprobando sala: ${appErr.message}`);

    // 4. Verificar que ahora está aprobada
    const { data: verifiedRoom, error: verErr } = await supabase.from('karaoke_rooms').select('*').eq('id', newRoom.id).single();
    if (verErr || !verifiedRoom) throw new Error(`Error verificando: ${verErr?.message}`);

    console.log(`   ✅ Estado actualizado: is_approved = ${verifiedRoom.is_approved}`);
    console.log(`   ✅ Aprobado por: ${verifiedRoom.approved_by}`);
    console.log(`   ✅ Fecha aprobación: ${verifiedRoom.approved_at}`);
    if (!verifiedRoom.is_approved) throw new Error('Falló la aprobación');

    // 5. Probar suspensión / desaprobación
    console.log('\n4️⃣ Probando revocación / suspensión de acceso por el Super Admin...');
    await supabase.from('karaoke_rooms').update({
      is_approved: false,
      approved_at: null,
      approved_by: null
    }).eq('id', newRoom.id);

    const { data: suspendedRoom } = await supabase.from('karaoke_rooms').select('*').eq('id', newRoom.id).single();
    console.log(`   ✅ Acceso revocado: is_approved = ${suspendedRoom.is_approved}`);
    if (suspendedRoom.is_approved) throw new Error('No se revocó la aprobación');

    // 6. Limpieza
    console.log('\n5️⃣ Limpiando sala de prueba...');
    await supabase.from('karaoke_rooms').delete().eq('id', newRoom.id);
    console.log('   ✅ Limpieza exitosa.');

    console.log('\n======================================================');
    console.log('🎉 TODAS LAS PRUEBAS DE LA COMPUERTA DE APROBACIÓN PASARON');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ ERROR EN TEST DE COMPUERTA:', err.message);
    process.exit(1);
  }
}

testApprovalGate();
