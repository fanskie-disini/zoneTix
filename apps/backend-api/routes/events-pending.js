// src/app/api/events-pending/route.js
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const eventData = await request.json();
    
    const { data, error } = await supabase
      .from("events_pending")
      .insert(eventData)
      .select()
      .single();

    if (error) {
      console.error("Error inserting pending event:", error);
      return NextResponse.json(
        { error: "Failed to submit event" },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}