import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTime } from '@/utils/format-time';
import Image from 'next/image';
import { VideoInfo } from '../page';

interface VideoInformationCardProps {
  videoInfo: VideoInfo | null;
  className?: string;
}

export function VideoInformationCard({
  videoInfo,
  className,
}: VideoInformationCardProps) {
  return (
    <Card className={className}>
      <CardHeader className='text-center'>
        <CardTitle className='text-3xl'>Informações do Vídeo</CardTitle>
      </CardHeader>
      <CardContent className=''>
        {videoInfo ? (
          <div className='flex space-x-6'>
            <Image
              src={videoInfo.thumbnail}
              width={200}
              height={200}
              alt='Thumbnail'
              className='rounded-lg'
            />
            <div className='flex w-full max-w-[40rem] flex-col truncate'>
              <p className='truncate text-xl font-semibold'>
                {videoInfo.title}
              </p>
              <p className='text-gray-500'>
                Duração: {formatTime(videoInfo.duration)}
              </p>
            </div>
          </div>
        ) : (
          <div className='flex items-center space-x-6'>
            <Skeleton className='h-[115px] w-[280px]' />
            <div className='flex w-full flex-col space-y-2'>
              <Skeleton className='h-6 w-[75%]' />
              <Skeleton className='h-4 w-[25%]' />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
