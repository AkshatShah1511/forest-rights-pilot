import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface PriorityBadgeProps {
  priority: 'High' | 'Medium' | 'Low';
  showIcon?: boolean;
  size?: 'default' | 'sm';
}

export function PriorityBadge({ priority, showIcon = true, size = 'default' }: PriorityBadgeProps) {
  const getVariantAndIcon = () => {
    switch (priority) {
      case 'High':
        return {
          variant: 'destructive' as const,
          icon: AlertTriangle,
          className: 'bg-priority-high text-white border-priority-high'
        };
      case 'Medium':
        return {
          variant: 'secondary' as const,
          icon: Clock,
          className: 'bg-priority-medium text-white border-priority-medium'
        };
      case 'Low':
        return {
          variant: 'outline' as const,
          icon: CheckCircle,
          className: 'bg-priority-low text-white border-priority-low'
        };
      default:
        return {
          variant: 'outline' as const,
          icon: CheckCircle,
          className: ''
        };
    }
  };

  const { variant, icon: Icon, className } = getVariantAndIcon();

  return (
    <Badge variant={variant} className={`${className} ${showIcon ? 'gap-1' : ''}`}>
      {showIcon && <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />}
      {priority}
    </Badge>
  );
}