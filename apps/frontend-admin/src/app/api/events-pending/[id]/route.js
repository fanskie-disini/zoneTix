// frontend-admin/src/app/api/events-pending/[id]/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// PATCH - Approve atau Reject event
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, rejection_reason, approved_by } = body;

    if (action === "approve") {
      // 1. Ambil data event pending
      const { data: pendingEvent, error: fetchError } = await supabase
        .from("event_pending")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        return NextResponse.json(
          { error: fetchError.message },
          { status: 400 }
        );
      }

      // 2. Pindahkan ke tabel events
      const { data: newEvent, error: insertError } = await supabase
        .from("events")
        .insert([
          {
            title: pendingEvent.title,
            location: pendingEvent.location,
            date: pendingEvent.date,
            image_url: pendingEvent.image_url,
            description: pendingEvent.description,
          },
        ])
        .select()
        .single();

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 400 }
        );
      }

      // 3. Pindahkan tickets ke event yang sudah diapprove
      const { data: tickets, error: ticketFetchError } = await supabase
        .from("tickets")
        .select("*")
        .eq("event_pending_id", id);

      if (!ticketFetchError && tickets.length > 0) {
        const updatedTickets = tickets.map((ticket) => ({
          ...ticket,
          event_id: newEvent.id,
          event_pending_id: null,
        }));

        // Hapus tickets lama
        await supabase.from("tickets").delete().eq("event_pending_id", id);

        // Insert tickets baru
        await supabase.from("tickets").insert(updatedTickets);
      }

      // 4. Update status event pending menjadi approved
      const { error: updateError } = await supabase
        .from("event_pending")
        .update({
          status: "approved",
          approved_by,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        message: "Event approved successfully",
        event: newEvent,
      });
    } else if (action === "reject") {
      // Update status menjadi rejected
      const { error: updateError } = await supabase
        .from("event_pending")
        .update({
          status: "rejected",
          rejection_reason,
          approved_by,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 400 }
        );
      }

      return NextResponse.json({ message: "Event rejected successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE - Hapus event pending
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Hapus tickets terkait
    await supabase.from("tickets").delete().eq("event_pending_id", id);

    // Hapus event pending
    const { error } = await supabase
      .from("event_pending")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
