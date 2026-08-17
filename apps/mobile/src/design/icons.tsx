import type { LucideIcon } from 'lucide-react-native';
import ArrowRight from 'lucide-react-native/icons/arrow-right';
import Building2 from 'lucide-react-native/icons/building-2';
import CalendarClock from 'lucide-react-native/icons/calendar-clock';
import Check from 'lucide-react-native/icons/check';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import CircleAlert from 'lucide-react-native/icons/circle-alert';
import CircleCheckBig from 'lucide-react-native/icons/circle-check-big';
import Clock from 'lucide-react-native/icons/clock';
import CloudOff from 'lucide-react-native/icons/cloud-off';
import LogIn from 'lucide-react-native/icons/log-in';
import LogOut from 'lucide-react-native/icons/log-out';
import Mic from 'lucide-react-native/icons/mic';
import PawPrint from 'lucide-react-native/icons/paw-print';
import Pause from 'lucide-react-native/icons/pause';
import Play from 'lucide-react-native/icons/play';
import RefreshCw from 'lucide-react-native/icons/refresh-cw';
import RotateCcw from 'lucide-react-native/icons/rotate-ccw';
import ShieldCheck from 'lucide-react-native/icons/shield-check';
import Square from 'lucide-react-native/icons/square';
import Trash2 from 'lucide-react-native/icons/trash-2';
import TriangleAlert from 'lucide-react-native/icons/triangle-alert';
import Upload from 'lucide-react-native/icons/upload';

import { iconSize } from './tokens';

/**
 * Icons are imported one file at a time rather than from the package barrel:
 * Metro does not tree-shake, and the barrel would ship every Lucide icon in
 * the bundle.
 *
 * This module is also the only place the set is declared, which is what keeps
 * one visual vocabulary across the six screens — the same rule the web app
 * follows with `lucide-react`.
 */
export const icons = {
  arrowRight: ArrowRight,
  building: Building2,
  calendar: CalendarClock,
  check: Check,
  chevronRight: ChevronRight,
  alert: CircleAlert,
  sent: CircleCheckBig,
  clock: Clock,
  offline: CloudOff,
  signIn: LogIn,
  signOut: LogOut,
  mic: Mic,
  patient: PawPrint,
  pause: Pause,
  play: Play,
  retry: RefreshCw,
  redo: RotateCcw,
  secure: ShieldCheck,
  stop: Square,
  delete: Trash2,
  warning: TriangleAlert,
  upload: Upload,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

export type IconProps = {
  name: IconName;
  color: string;
  size?: number;
  strokeWidth?: number;
};

/**
 * Every icon here is decoration on top of a label that already carries the
 * meaning, so all of them are hidden from the accessibility tree. An icon that
 * ever becomes the only signal must get its own labelled wrapper instead.
 */
export function Icon({
  name,
  color,
  size = iconSize.md,
  strokeWidth = 2,
}: IconProps) {
  const Component = icons[name];

  return (
    <Component
      accessibilityElementsHidden
      color={color}
      importantForAccessibility="no-hide-descendants"
      size={size}
      strokeWidth={strokeWidth}
    />
  );
}
