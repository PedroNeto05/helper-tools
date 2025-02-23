'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { DownloadVideoForm } from '@/app/video/download/components/download-video-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { formatTime } from '@/utils/format-time';

type Format = {
  ext: string;
  format_id: string;
  resolution: string;
};

export type VideoInfo = {
  title: string;
  thumbnail: string;
  duration: number;
  formats: Format[];
};

export default function VideoDownloader() {
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [validUrl, setValidUrl] = useState<boolean>(false);
  const [audioOnly, setAudioOnly] = useState<boolean>(false);
  const [dialogError, setDialogError] = useState<boolean>(false);
  const [dialogErrorMessage, setDialogErrorMessage] = useState<string>('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);

  return (
    <div className='flex h-full space-x-5'>
      <div className='flex flex-1 flex-col space-y-5'>
        <DownloadVideoForm
          audioOnly={audioOnly}
          isFetching={isFetching}
          setAudioOnly={setAudioOnly}
          validUrl={validUrl}
          videoInfo={videoInfo}
          setValidUrl={setValidUrl}
          setIsFetching={setIsFetching}
          setInvalidUrlDialog={setDialogError}
          setVideoInfo={setVideoInfo}
          setDialogErrorMessage={setDialogErrorMessage}
        />
      </div>
      <div className='flex flex-1 flex-col space-y-5'>
        <Card className='flex-1 items-center'>
          <CardHeader className='text-center'>
            <CardTitle className='text-3xl'>Informações do Vídeo</CardTitle>
          </CardHeader>
          <CardContent className=''>
            {isFetching ? (
              <div className='flex items-center space-x-6'>
                <Skeleton className='h-[115px] w-[280px]' />
                <div className='flex w-full flex-col space-y-2'>
                  <Skeleton className='h-6 w-[75%]' />
                  <Skeleton className='h-4 w-[25%]' />
                </div>
              </div>
            ) : videoInfo ? (
              <div className='flex space-x-6'>
                <Image
                  src={videoInfo.thumbnail as string}
                  width={200}
                  height={200}
                  alt='Thumbnail'
                  className='rounded-lg'
                />
                <div className='flex w-full flex-col overflow-hidden'>
                  <p className='overflow-hidden text-xl font-semibold'>
                    {videoInfo.title}
                  </p>
                  <p className='text-gray-500'>
                    Duração: {formatTime(videoInfo.duration)}
                  </p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Card className='flex-10 p-4'>
          <h1>fila de downloads e baixar a fila</h1>
        </Card>
      </div>
      <Dialog open={dialogError} onOpenChange={setDialogError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Erro ao buscar vídeo</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <p className='text-red-500'>
              {dialogErrorMessage || 'Ocorreu um erro ao buscar o vídeo'}
            </p>
            <Button
              variant='destructive'
              onClick={() => setDialogError(false)}
              className='cursor-pointer'
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
