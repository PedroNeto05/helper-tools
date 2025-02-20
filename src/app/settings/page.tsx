'use client';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  return (
    <div className='flex h-full space-x-5'>
      <div className='flex items-center space-x-2'>
        <Switch
          checked={theme === 'dark'}
          onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        />
        <label>Theme:</label>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className='rounded-lg bg-gray-200 p-2 dark:bg-gray-800'
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </div>
    </div>
  );
}
