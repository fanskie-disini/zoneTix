// EventCardDate.jsx
"use client";

export default function EventCardDate({ date }) {
  const formattedDate = new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return <span>{formattedDate}</span>;
}
