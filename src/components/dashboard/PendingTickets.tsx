
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface Ticket {
  id: string;
  description: string;
  status: 'urgent' | 'inprogress' | 'pending';
}

interface PendingTicketsProps {
  tickets: Ticket[];
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'urgent':
      return <Badge className="bg-label-red">Urgent</Badge>;
    case 'inprogress':
      return <Badge className="bg-label-yellow text-black">In Progress</Badge>;
    case 'pending':
      return <Badge className="bg-slate-200 text-slate-800">Pending</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
};

const PendingTickets: React.FC<PendingTicketsProps> = ({ tickets }) => {
  return (
    <div className="bg-white rounded-md border border-gray-200 p-4">
      <h3 className="font-medium mb-3">Pending Tickets</h3>
      
      <div className="space-y-3">
        {tickets.map(ticket => (
          <div 
            key={ticket.id} 
            className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0"
          >
            <div>
              <p className="text-sm font-medium">{ticket.id}</p>
              <p className="text-xs text-gray-500">{ticket.description}</p>
            </div>
            {getStatusBadge(ticket.status)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingTickets;
