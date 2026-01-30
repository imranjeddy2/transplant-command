import type { TransplantCenterConfig } from '@/config/transplantCenters';

interface SchedulingHeaderProps {
  center: TransplantCenterConfig;
}

export function SchedulingHeader({ center }: SchedulingHeaderProps) {
  return (
    <header
      className="w-full py-6 px-4 border-b"
      style={{ borderColor: `${center.primaryColor}20` }}
    >
      <div className="max-w-2xl mx-auto text-center">
        <h1
          className="text-xl font-semibold"
          style={{ color: center.primaryColor }}
        >
          {center.name}
        </h1>
      </div>
    </header>
  );
}
