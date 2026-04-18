const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  const envFile = fs.readFileSync('.env.example', 'utf8');
  console.log(envFile);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  const { data, error } = await supabase
    .from('turfs')
    .select('*, owner:users(*)')
    .limit(1);

  console.log("With custom alias 'owner:users(*)'", { data, error });

  const { data: data2, error: error2 } = await supabase
    .from('turfs')
    .select('*, users(*)')
    .limit(1);

  console.log("With 'users(*)'", { data2, error2 });
}

testQuery();
