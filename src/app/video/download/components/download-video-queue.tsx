import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DownloadVideoItem } from '../page';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

interface DownloadVideoQueueProps {
  videoQueue: DownloadVideoItem[];
  setVideoQueue: (data: DownloadVideoItem[]) => void;
}

export function DownloadVideoQueue({
  videoQueue,
  setVideoQueue,
}: DownloadVideoQueueProps) {
  function handleDelete(url: string) {
    const newQueue = videoQueue.filter((item) => item.url !== url);
    setVideoQueue(newQueue);
  }
  return (
    <Card className='flex h-full flex-col'>
      <CardHeader className='text-center'>
        <CardTitle className='text-3xl'>Fila de Download</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-1 flex-col overflow-hidden'>
        <ScrollArea className='flex-1 overflow-y-auto'>
          <div className='absolute flex w-full flex-col space-y-4'>
            {videoQueue &&
              videoQueue.map((item) => {
                return (
                  <div
                    key={item.thumbnail}
                    className='border-border flex justify-between space-x-4 rounded-md border p-4'
                  >
                    <div className='flex w-full space-x-6'>
                      <Image
                        src={item.thumbnail}
                        width={150}
                        height={150}
                        alt='Thumbnail'
                        className='rounded-lg'
                      />
                      <div className='flex w-full max-w-[40rem] flex-col truncate'>
                        <p className='truncate font-semibold'>{item.title}</p>
                      </div>
                    </div>
                    <Button
                      variant='destructive'
                      className='cursor-pointer'
                      onClick={() => {
                        handleDelete(item.url);
                      }}
                    >
                      <Trash />
                    </Button>
                  </div>
                );
              })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
