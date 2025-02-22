import { format, setHours, setMinutes, setSeconds } from 'date-fns';

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const date = setHours(
    setMinutes(setSeconds(new Date(0), secs), minutes),
    hours
  );
  return format(date, 'HH:mm:ss');
}
