import { forwardRef } from 'react';
import { LucideProps } from 'lucide-react';

export const NairaIcon = forwardRef<SVGSVGElement, LucideProps>(
  (props, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 20V4l14 16V4" />
      <path d="M3 12h18" />
      <path d="M3 8h18" />
    </svg>
  )
);

NairaIcon.displayName = 'NairaIcon';
