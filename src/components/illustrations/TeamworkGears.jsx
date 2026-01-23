import React from 'react';

export default function TeamworkGears({ className = "w-full h-full" }) {
  return (
    <svg className={className} viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background circle */}
      <circle cx="200" cy="150" r="120" className="fill-slate-100 dark:fill-slate-800" opacity="0.5"/>
      
      {/* Large gear */}
      <g transform="translate(250, 100)">
        <circle cx="0" cy="0" r="45" className="fill-sky-400 dark:fill-sky-500"/>
        <circle cx="0" cy="0" r="30" className="fill-white dark:fill-slate-900"/>
        <circle cx="0" cy="0" r="15" className="fill-sky-400 dark:fill-sky-500"/>
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * 40;
          const y = Math.sin(rad) * 40;
          return (
            <rect 
              key={i}
              x={x - 5} 
              y={y - 8} 
              width="10" 
              height="16" 
              className="fill-sky-400 dark:fill-sky-500"
              transform={`rotate(${angle} ${x} ${y})`}
            />
          );
        })}
      </g>
      
      {/* Small gear */}
      <g transform="translate(180, 170)">
        <circle cx="0" cy="0" r="25" className="fill-slate-400 dark:fill-slate-600"/>
        <circle cx="0" cy="0" r="18" className="fill-white dark:fill-slate-900"/>
        <circle cx="0" cy="0" r="8" className="fill-slate-400 dark:fill-slate-600"/>
        {[0, 90, 180, 270].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * 22;
          const y = Math.sin(rad) * 22;
          return (
            <rect 
              key={i}
              x={x - 4} 
              y={y - 6} 
              width="8" 
              height="12" 
              className="fill-slate-400 dark:fill-slate-600"
              transform={`rotate(${angle} ${x} ${y})`}
            />
          );
        })}
      </g>
      
      {/* Person 1 */}
      <g transform="translate(120, 180)">
        <ellipse cx="0" cy="-30" rx="12" ry="15" className="fill-slate-800 dark:fill-slate-200"/>
        <circle cx="0" cy="-30" r="10" className="fill-slate-700 dark:fill-slate-300"/>
        <rect x="-15" y="-15" width="30" height="35" rx="5" className="fill-sky-500 dark:fill-sky-400"/>
        <rect x="-12" y="20" width="10" height="25" rx="5" className="fill-slate-700 dark:fill-slate-300"/>
        <rect x="2" y="20" width="10" height="25" rx="5" className="fill-slate-700 dark:fill-slate-300"/>
        <rect x="-25" y="-10" width="12" height="20" rx="5" className="fill-sky-500 dark:fill-sky-400" transform="rotate(-30 -25 -10)"/>
        <rect x="25" y="-10" width="12" height="20" rx="5" className="fill-sky-500 dark:fill-sky-400" transform="rotate(30 25 -10)"/>
      </g>
      
      {/* Person 2 */}
      <g transform="translate(280, 190)">
        <ellipse cx="0" cy="-30" rx="12" ry="15" className="fill-slate-800 dark:fill-slate-200"/>
        <circle cx="0" cy="-30" r="10" className="fill-slate-700 dark:fill-slate-300"/>
        <rect x="-15" y="-15" width="30" height="35" rx="5" className="fill-slate-700 dark:fill-slate-300"/>
        <rect x="-12" y="20" width="10" height="25" rx="5" className="fill-slate-800 dark:fill-slate-200"/>
        <rect x="2" y="20" width="10" height="25" rx="5" className="fill-slate-800 dark:fill-slate-200"/>
        <rect x="-25" y="-5" width="12" height="18" rx="5" className="fill-slate-700 dark:fill-slate-300" transform="rotate(45 -25 -5)"/>
      </g>
      
      {/* Arrow up */}
      <path d="M 320 80 L 330 50 L 340 80" className="stroke-sky-500 dark:stroke-sky-400" strokeWidth="3" fill="none"/>
      <line x1="330" y1="50" x2="330" y2="90" className="stroke-sky-500 dark:stroke-sky-400" strokeWidth="3"/>
    </svg>
  );
}