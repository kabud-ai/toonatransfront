import React from 'react';

export default function EmptyBox({ className = "w-full h-full" }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Box base */}
      <path 
        d="M 100 80 L 140 100 L 140 140 L 100 160 L 60 140 L 60 100 Z" 
        className="fill-slate-200 dark:fill-slate-700"
      />
      
      {/* Box top */}
      <path 
        d="M 100 60 L 140 80 L 140 100 L 100 80 L 60 100 L 60 80 Z" 
        className="fill-slate-300 dark:fill-slate-600"
      />
      
      {/* Box left side */}
      <path 
        d="M 60 80 L 60 100 L 60 140 L 100 160 L 100 80 Z" 
        className="fill-slate-250 dark:fill-slate-650"
        opacity="0.6"
      />
      
      {/* Gear decoration */}
      <g transform="translate(100, 110)">
        <circle cx="0" cy="0" r="18" className="fill-sky-400 dark:fill-sky-500" opacity="0.5"/>
        <circle cx="0" cy="0" r="10" className="fill-white dark:fill-slate-800"/>
        {[0, 90, 180, 270].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * 16;
          const y = Math.sin(rad) * 16;
          return (
            <rect 
              key={i}
              x={x - 2.5} 
              y={y - 4} 
              width="5" 
              height="8" 
              className="fill-sky-400 dark:fill-sky-500"
              opacity="0.5"
              transform={`rotate(${angle} ${x} ${y})`}
            />
          );
        })}
      </g>
    </svg>
  );
}