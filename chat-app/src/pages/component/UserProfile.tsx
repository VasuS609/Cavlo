import { useAuth0 } from "@auth0/auth0-react"
import { useState } from "react";
import LogoutButton from "../../authentication/LogoutButton";

const UserProfile = () => {
  const {user, isAuthenticated, logout} = useAuth0();
  const [isOpen, setIsOpen] = useState(false);

  if(!isAuthenticated){
    console.warn('Please Login!')
    return null;
  }

  const toggleDropDown = () => {
    setIsOpen(!isOpen); // Fixed: Actually update the state
  };

  return (
    <div className="relative">
      {/* Avatar/Button - Added onClick */}
      <button onClick={toggleDropDown} className="focus:outline-none">
        {user?.picture ? (
          <img 
            src={user.picture} 
            alt={user?.name} 
            className="w-10 h-10 rounded-full cursor-pointer"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white cursor-pointer">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0  w-58 bg-white shadow-2xl rounded-md  -py-1 z-10">
          <div className="px-4 py-1 border-b text-gray-700">
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm">{user?.email}</p>
         <div>
          <LogoutButton />
         </div>
          
           </div>
        </div>
      )}

      {/* Backdrop - closes dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default UserProfile;