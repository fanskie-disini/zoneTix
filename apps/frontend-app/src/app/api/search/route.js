//import { supabase } from "@/utils/supabaseClient";
/*
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  const { data, error } = await supabase
    .from("tickets")
    .select("id, event, location")
    .ilike("event", `%${query}%`);

  if (error) {
    return new Response(JSON.stringify([]), { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}
*/

// File: app/api/search/route.js
import { getEvents } from '@/utils/fetchEvents';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query')?.toLowerCase() || '';

  const events = await getEvents();

  const filtered = events.filter((event) =>
    event.title.toLowerCase().includes(query) ||
    event.location.toLowerCase().includes(query)
  );

  return Response.json(filtered);
}
