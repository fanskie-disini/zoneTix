import TicketIcon from "@/components/icons/ticket.svg";
import Link from "next/link";

export default function FloatingButton() {
  return (
    <div className="group fixed bottom-6 right-6 z-50">
      <Link
        href="/event/create"
        className="p-3 rounded-full flex items-center justify-center transition-transform hover:scale-110"
      >
        <div className="w-12 h-12 transition-transform duration-300 group-hover:rotate-30">
          <TicketIcon className="w-full h-full text-[#7E5CAD]" />
        </div>
      </Link>

      {/* Tooltip */}
      <div className="absolute bottom-20 right-8 transform translate-x-2 bg-[#72BAA9] text-[#e3e6ff] text-sm font-medium px-3 py-1 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300">
        Daftarkan event kamu!
        <div className="absolute top-full right-4 w-2 h-2 bg-[#72BAA9] rotate-45 transform origin-top-left" />
      </div>
    </div>
  );
}
