export default function LoginButton() {
  return (
    <div className=" bg-gray-100 flex items-center justify-center">
      <a 
        href="/login"
        className="inline-flex items-center justify-center border-2 border-black rounded-full bg-black py-2.5 px-6 text-center text-white outline-0 transition-all duration-300 ease-in-out hover:bg-transparent hover:text-black no-underline"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 16 16" 
          fill="currentColor" 
          className="h-6 w-6"
        >
          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
        </svg>
        <span className="ml-4 font-semibold">Login</span>
      </a>
    </div>
  );
}