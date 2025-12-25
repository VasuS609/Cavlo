import { useAuth0 } from "./useAuth0Safe";

const LogoutButton = () => {
  const { logout } = useAuth0();
  return (
    

      <div className=" bg-gray-100 flex items-center justify-center">
      <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        type="button"
        className="bg-white text-center w-48 rounded-2xl h-14 relative text-black text-xl font-semibold border-4 border-white group overflow-hidden"
      >
        <div className="bg-red-400 rounded-xl h-12 w-1/4 grid place-items-center absolute left-0 top-0 group-hover:w-full z-10 transition-all duration-500">
          <svg
            width="25px"
            height="25px"
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#000000"
              d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"
            ></path>
            <path
              fill="#000000"
              d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
            ></path>
          </svg>
        </div>
        <p className="translate-x-4 relative z-0">Logout</p>
      </button>
    </div>
  );
};

export default LogoutButton;