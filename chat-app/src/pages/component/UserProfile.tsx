import { useAuth0 } from "@auth0/auth0-react"
import { useState } from "react";
import LogoutButton from "../../authentication/LogoutButton";


const UserProfile = ()=>{
  const {user, isAuthenticated, logout} = useAuth0();
  const [isOpen, setIsOpen] = useState(false);

  if(!isAuthenticated){
    console.warn('Please Login!')
    return null;
  }

  const toggleDropDown = ()=>(!isOpen);

  return (
    <div className="relative">
      <button
      onClick={toggleDropDown}
      className="w-10 h-10 rounded-full overflow-hidden focus:outline-none"
      aria-label="User menu"
      >
         {user?.picture? (
          <img src={user.picture} className="w-full h-full object-cover"/>
         ):(
          <div className="bg-gray-300 w-full h-full flex items-center justify-center">
            <span>{user?.name?.charAt(0).toUpperCase()}</span>
             </div>
         )}
      </button>

      {/* dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg py-1 z-10">
          <div className="px-4 py-2 border-b">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
          </div>
          <div className="px-4 py-2"><LogoutButton/></div>
        </div>
      )}

      {/* closed deopdown when clicking outside */}
      {isOpen && (
        <div
        className="fixed inset-0 z-0"
        onClick={()=>setIsOpen(false)}
        ></div>
      )}
    </div>

  )
}

export default UserProfile;