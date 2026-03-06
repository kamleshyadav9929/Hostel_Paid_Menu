import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://obczxvdvnzjvwgoyolbg.supabase.co', 'sb_publishable_Itc9sVFdZTKcBE77yMNgOQ_tSpCqC8_');

async function run() {
  await supabase.from('users').update({ password_hash: '$2a$10$RWlj2pL4OdJny.2cVqobWeYixvb2hPdgg6bbRUiq9otwf/X02AxdG' }).eq('roll_number', 'admin1');
  await supabase.from('users').update({ password_hash: '$2a$10$xJBhtKzTcwMQqCRC2KMwvOPZ8n3QJ4qi5IclmLr96UGLTxauFH9k6' }).eq('roll_number', '2023123');
  console.log('Fixed auth hashes for test accounts!');
}

run();
