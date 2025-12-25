export default function SendButton() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <button
        className="font-inherit text-lg bg-gradient-to-b from-[#4dc7d9] to-[#66a6ff] text-white py-3 px-5 flex items-center justify-center border-none rounded-[25px] shadow-[0px_5px_10px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0px_8px_15px_rgba(0,0,0,0.3)] active:scale-95 active:shadow-[0px_2px_5px_rgba(0,0,0,0.2)] group"
      >
        <div className="svg-wrapper-1">
          <div className="flex items-center justify-center w-[30px] h-[30px] rounded-full bg-white/20 mr-2 transition-all duration-300 group-hover:bg-white/50">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              width="18" 
              height="18"
              className="fill-white transition-all duration-300 group-hover:rotate-45"
            >
              <path fill="none" d="M0 0h24v24H0z"></path>
              <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"></path>
            </svg>
          </div>
        </div>
        <span className="block ml-2 transition-all duration-300">Send</span>
      </button>
    </div>
  );
}