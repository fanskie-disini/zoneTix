import TicketIcon from "@/assets/ticket.svg";

export default function MyIcon() {
  return (
    <div className="transition-transform duration-300 hover:rotate-12">
      <TicketIcon className="w-10 h-10 text-purple-600" />
    </div>
  );
}
