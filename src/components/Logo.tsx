export default function Logo({ className = "", showText = true }: { className?: string, showText?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${className} select-none group`}>
      
      {/* --- THE ASCENT ICON --- */}
      <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#4A2B5E] to-[#2D1B3E] dark:from-white dark:to-gray-200 rounded-xl shadow-lg shadow-[#4A2B5E]/10 dark:shadow-white/5 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
         
         {/* Abstract Shape: A Paper Plane / Arrow Taking Off */}
         <svg 
           viewBox="0 0 24 24" 
           fill="none" 
           className="w-5 h-5 text-white dark:text-[#4A2B5E] translate-x-[-1px] translate-y-[1px]"
         >
           {/* Main Arrow Body */}
           <path 
             d="M3 12L21 3L12 21L10.5 13.5L3 12Z" 
             stroke="currentColor" 
             strokeWidth="2" 
             strokeLinecap="round" 
             strokeLinejoin="round" 
             className="fill-white/10 dark:fill-[#4A2B5E]/10"
           />
           {/* The "Trail" or Digital Path */}
           <path 
             d="M21 3L10.5 13.5" 
             stroke="currentColor" 
             strokeWidth="2" 
             strokeLinecap="round"
             className="opacity-50" 
           />
         </svg>
      </div>

      {/* --- BRANDING --- */}
      {showText && (
        <div className="flex flex-col justify-center">
          <h1 className="text-lg font-bold text-[#4A2B5E] dark:text-white leading-none tracking-tight flex items-center gap-1">
            AI Counsellor
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFC229] mb-3"></span>
          </h1>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest pl-[1px]">
            Global Admissions
          </p>
        </div>
      )}
    </div>
  )
}