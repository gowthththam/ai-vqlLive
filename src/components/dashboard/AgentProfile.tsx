
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Mail, User, ChevronDown } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface AgentProfileProps {
  name: string;
  role: string;
  location: string;
  email: string;
  employeeId: string;
  avatarUrl?: string;
}

const AgentProfile: React.FC<AgentProfileProps> = ({
  name,
  role,
  location,
  email,
  employeeId,
  avatarUrl
}) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  
  return (
    <div className="bg-white rounded-md border border-gray-200 p-4">
      <div className="flex items-center mb-4">
        <Avatar className="w-12 h-12 mr-3">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={name} />
          ) : (
            <AvatarFallback>{initials}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <div className="flex items-center">
            <h3 className="font-medium text-lg">{name}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-1">
                <ChevronDown className="h-4 w-4 text-gray-500 cursor-pointer" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>Update Profile</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{email}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm">Employee ID: {employeeId}</span>
        </div>
      </div>
    </div>
  );
};

export default AgentProfile;
