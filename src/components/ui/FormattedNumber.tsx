import { AnimatedCounter } from './animated/AnimatedCounter';
import { formatNumber } from '@/utils/formatters';

interface FormattedNumberProps {
  value: number;
  animated?: boolean;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export const FormattedNumber = ({
  value,
  animated = false,
  suffix,
  prefix,
  className,
}: FormattedNumberProps) => {
  if (animated) {
    return (
      <AnimatedCounter
        value={value}
        suffix={suffix}
        prefix={prefix}
        className={className}
      />
    );
  }

  return (
    <span className={className}>
      {prefix}
      {formatNumber(value)}
      {suffix}
    </span>
  );
};
