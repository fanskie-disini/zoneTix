// app/api/events/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create admin client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // This bypasses RLS
);

// Regular client for user operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET - Fetch all events
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const search = searchParams.get("search");
    const location = searchParams.get("location");

    let query = supabaseAdmin
      .from("events")
      .select(
        `
        *,
        tickets (
          id,
          name,
          price
        )
      `
      )
      .order("created_at", { ascending: false });

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply location filter
    if (location) {
      query = query.ilike("location", `%${location}%`);
    }

    // Apply limit
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch events", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new event
export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Received payload:", body);

    // Validate required fields
    const { title, location, date, description, tickets } = body;

    if (!title || !location || !date || !description) {
      return NextResponse.json(
        {
          error: "Missing required fields: title, location, date, description",
        },
        { status: 400 }
      );
    }

    if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
      return NextResponse.json(
        { error: "At least one ticket is required" },
        { status: 400 }
      );
    }

    // Validate tickets
    for (const ticket of tickets) {
      if (!ticket.name || typeof ticket.price !== "number") {
        return NextResponse.json(
          { error: "Each ticket must have a name and valid price" },
          { status: 400 }
        );
      }
    }

    // Prepare event data
    const eventData = {
      title: title.trim(),
      location: location.trim(),
      date: date,
      image_url: body.image_url || null,
      description: description.trim(),
    };

    console.log("Inserting event data:", eventData);

    // Insert event into database using admin client to bypass RLS
    const { data: eventResult, error: eventError } = await supabaseAdmin
      .from("events")
      .insert([eventData])
      .select()
      .single();

    if (eventError) {
      console.error("Event insertion error:", eventError);
      return NextResponse.json(
        { error: "Failed to create event", details: eventError.message },
        { status: 500 }
      );
    }

    console.log("Event created successfully:", eventResult);

    // Prepare tickets data
    const ticketsData = tickets.map((ticket) => ({
      event_id: eventResult.id,
      name: ticket.name.trim(),
      price: ticket.price,
    }));

    console.log("Inserting tickets data:", ticketsData);

    // Insert tickets into database using admin client
    const { data: ticketsResult, error: ticketsError } = await supabaseAdmin
      .from("tickets")
      .insert(ticketsData)
      .select();

    if (ticketsError) {
      console.error("Tickets insertion error:", ticketsError);

      // If tickets insertion fails, we should clean up the event
      await supabaseAdmin.from("events").delete().eq("id", eventResult.id);

      return NextResponse.json(
        { error: "Failed to create tickets", details: ticketsError.message },
        { status: 500 }
      );
    }

    console.log("Tickets created successfully:", ticketsResult);

    // Return success response with created data
    return NextResponse.json(
      {
        success: true,
        message: "Event created successfully",
        data: {
          event: eventResult,
          tickets: ticketsResult,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update existing event
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, title, location, date, description, image_url, tickets } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Update event
    const eventData = {
      title: title?.trim(),
      location: location?.trim(),
      date,
      description: description?.trim(),
      image_url,
    };

    // Remove undefined values
    Object.keys(eventData).forEach((key) => {
      if (eventData[key] === undefined) {
        delete eventData[key];
      }
    });

    const { data: eventResult, error: eventError } = await supabaseAdmin
      .from("events")
      .update(eventData)
      .eq("id", id)
      .select()
      .single();

    if (eventError) {
      console.error("Event update error:", eventError);
      return NextResponse.json(
        { error: "Failed to update event", details: eventError.message },
        { status: 500 }
      );
    }

    // Update tickets if provided
    if (tickets && Array.isArray(tickets)) {
      // Delete existing tickets
      await supabaseAdmin.from("tickets").delete().eq("event_id", id);

      // Insert new tickets
      const ticketsData = tickets.map((ticket) => ({
        event_id: id,
        name: ticket.name.trim(),
        price: ticket.price,
      }));

      const { data: ticketsResult, error: ticketsError } = await supabaseAdmin
        .from("tickets")
        .insert(ticketsData)
        .select();

      if (ticketsError) {
        console.error("Tickets update error:", ticketsError);
        return NextResponse.json(
          { error: "Failed to update tickets", details: ticketsError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Event updated successfully",
        data: {
          event: eventResult,
          tickets: ticketsResult,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Event updated successfully",
      data: {
        event: eventResult,
      },
    });
  } catch (error) {
    console.error("PUT /api/events error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete event
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Delete tickets first (foreign key constraint)
    const { error: ticketsError } = await supabaseAdmin
      .from("tickets")
      .delete()
      .eq("event_id", id);

    if (ticketsError) {
      console.error("Tickets deletion error:", ticketsError);
      return NextResponse.json(
        { error: "Failed to delete tickets", details: ticketsError.message },
        { status: 500 }
      );
    }

    // Delete event
    const { data: eventResult, error: eventError } = await supabaseAdmin
      .from("events")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (eventError) {
      console.error("Event deletion error:", eventError);
      return NextResponse.json(
        { error: "Failed to delete event", details: eventError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
      data: eventResult,
    });
  } catch (error) {
    console.error("DELETE /api/events error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
