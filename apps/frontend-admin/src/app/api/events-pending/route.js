// frontend-admin/src/app/api/events-pending/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Ambil semua event pending
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("event_pending")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST - Buat event pending baru
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      location,
      date,
      imageUrl,
      description,
      tickets,
      organizer_id,
    } = body;

    const { data, error } = await supabase
      .from("event_pending")
      .insert([
        {
          title,
          description,
          location,
          date,
          image_url: imageUrl,
          organizer_id,
          status: "pending",
          rejection_reason: null,
          approved_by: null,
          approved_at: null,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Simpan tickets ke tabel tickets dengan event_pending_id
    if (tickets && tickets.length > 0) {
      const ticketData = tickets.map((ticket) => ({
        event_id: null, // Kosong karena masih pending
        event_pending_id: data.id, // ID dari event pending
        name: ticket.name,
        price: ticket.price,
      }));

      const { error: ticketError } = await supabase
        .from("tickets")
        .insert(ticketData);

      if (ticketError) {
        console.error("Error inserting tickets:", ticketError);
      }
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
