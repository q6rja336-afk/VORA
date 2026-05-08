import { supabase } from './src/lib/supabase';

async function debugSync() {
  console.log("Checking Supabase content...");
  const { data: content, error } = await supabase
    .from('content')
    .select('*')
    .ilike('title', '%Americans%');

  if (error) {
    console.error("Supabase Error:", error);
    return;
  }

  if (!content || content.length === 0) {
    console.log("No content found with title 'Americans'");
    return;
  }

  content.forEach(item => {
    console.log(`ID: ${item.id}`);
    console.log(`Title: ${item.title}`);
    console.log(`IMDb ID: ${item.imdb_id}`);
    console.log(`Type: ${item.type}`);
    console.log(`Seasons Data Length: ${item.seasons_data ? item.seasons_data.length : 'NULL'}`);
    console.log("---");
  });
}

debugSync();
