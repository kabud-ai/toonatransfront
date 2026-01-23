import React from 'react';

export default function ProductionFlow({ className = "w-full h-full" }) {
  return (
    <svg className={className} viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <ellipse cx="200" cy="150" rx="150" ry="120" className="fill-slate-100 dark:fill-slate-800" opacity="0.4"/>
      
      {/* Conveyor belt */}
      <rect x="50" y="220" width="300" height="8" rx="4" className="fill-slate-600 dark:fill-slate-400"/>
      <circle cx="70" cy="224" r="6" className="fill-slate-500 dark:fill-slate-500"/>
      <circle cx="330" cy="224" r="6" className="fill-slate-500 dark:fill-slate-500"/>
      
      {/* Gears - Left */}
      <g transform="translate(100, 140)">
        <circle cx="0" cy="0" r="35" className="fill-sky-400 dark:fill-sky-500" opacity="0.8"/>
        <circle cx="0" cy="0" r="22" className="fill-white dark:fill-slate-900"/>
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * 32;
          const y = Math.sin(rad) * 32;
          return (
            <rect 
              key={i}
              x={x - 4} 
              y={y - 6} 
              width="8" 
              height="12" 
              className="fill-sky-400 dark:fill-sky-500"
              opacity="0.8"
              transform={`rotate(${angle} ${x} ${y})`}
            />
          );
        })}
      </g>
      
      {/* Gears - Right top */}
      <g transform="translate(280, 100)">
        <circle cx="0" cy="0" r="25" className="fill-slate-400 dark:fill-slate-600"/>
        <circle cx="0" cy="0" r="16" className="fill-white dark:fill-slate-900"/>
        {[0, 90, 180, 270].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * 22;
          const y = Math.sin(rad) * 22;
          return (
            <rect 
              key={i}
              x={x - 3} 
              y={y - 5} 
              width="6" 
              height="10" 
              className="fill-slate-400 dark:fill-slate-600"
              transform={`rotate(${angle} ${x} ${y})`}
            />
          );
        })}
      </g>
      
      {/* Gears - Right bottom */}
      <g transform="translate(300, 160)">
        <circle cx="0" cy="0" r="28" className="fill-sky-300 dark:fill-sky-600"/>
        <circle cx="0" cy="0" r="18" className="fill-white dark:fill-slate-900"/>
        {[0, 72, 144, 216, 288].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * 25;
          const y = Math.sin(rad) * 25;
          return (
            <rect 
              key={i}
              x={x - 3} 
              y={y - 5} 
              width="6" 
              height="10" 
              className="fill-sky-300 dark:fill-sky-600"
              transform={`rotate(${angle} ${x} ${y})`}
            />
          );
        })}
      </g>
      
      {/* Person working */}
      <g transform="translate(180, 180)">
        <circle cx="0" cy="-35" r="12" className="fill-slate-700 dark:fill-slate-300"/>
        <rect x="-18" y="-20" width="36" height="40" rx="6" className="fill-sky-500 dark:fill-sky-400"/>
        <rect x="-15" y="20" width="12" height="30" rx="6" className="fill-slate-700 dark:fill-slate-300"/>
        <rect x="3" y="20" width="12" height="30" rx="6" className="fill-slate-700 dark:fill-slate-300"/>
        <rect x="-30" y="-15" width="15" height="25" rx="6" className="fill-sky-500 dark:fill-sky-400" transform="rotate(-20 -30 -15)"/>
        <rect x="22" y="-10" width="15" height="25" rx="6" className="fill-sky-500 dark:fill-sky-400" transform="rotate(45 22 -10)"/>
      </g>
      
      {/* Wrench tool */}
      <g transform="translate(210, 130)">
        <rect x="0" y="0" width="8" height="40" rx="2" className="fill-slate-600 dark:fill-slate-400" transform="rotate(30)"/>
        <circle cx="0" cy="0" r="5" className="fill-slate-600 dark:fill-slate-400"/>
      </g>
      
      {/* Progress arrows */}
      <path d="M 40 100 L 50 90 L 40 80" className="stroke-sky-400 dark:stroke-sky-500" strokeWidth="2.5" fill="none"/>
      <line x1="20" y1="90" x2="48" y2="90" className="stroke-sky-400 dark:stroke-sky-500" strokeWidth="2.5"/>
    </svg>
  );
}