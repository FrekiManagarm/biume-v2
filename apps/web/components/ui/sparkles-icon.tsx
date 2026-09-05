"use client";

import { cn } from "@/lib/style";

interface SparklesIconProps {
  className?: string;
  gradientId?: string;
}

export function SparklesIcon({ className, gradientId = "sparkles-gradient" }: SparklesIconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-all", className)}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop
            offset="0%"
            stopColor="rgb(147 51 234)"
            stopOpacity="0.8"
            className="transition-all"
          />
          <stop
            offset="50%"
            stopColor="rgb(219 39 119)"
            stopOpacity="0.8"
            className="transition-all"
          />
          <stop
            offset="100%"
            stopColor="rgb(249 115 22)"
            stopOpacity="0.8"
            className="transition-all"
          />
        </linearGradient>
      </defs>
      <path
        d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.583a.5.5 0 0 1 0 .96L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
        fill={`url(#${gradientId})`}
      />
      <path
        d="M20 3v4M22 5h-4M6 21v-3M4 19h4"
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

