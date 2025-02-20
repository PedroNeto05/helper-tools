'use client';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { DownloadVideoForm } from '@/components/download-video-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function VideoDownloader() {
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [validUrl, setValidUrl] = useState<boolean>(false);
  const [audioOnly, setAudioOnly] = useState<boolean>(false);
  const [InvalidUrlDialog, setInvalidUrlDialog] = useState<boolean>(false);

  return (
    <div className='flex h-full space-x-5'>
      <div className='flex flex-1 flex-col space-y-5'>
        <DownloadVideoForm
          audioOnly={audioOnly}
          isFetching={isFetching}
          setAudioOnly={setAudioOnly}
          validUrl={validUrl}
          setValidUrl={setValidUrl}
          setIsFetching={setIsFetching}
          setInvalidUrlDialog={setInvalidUrlDialog}
        />
      </div>
      <Card className='flex-1 p-4'>
        <h1>fila de downloads e baixar a fila</h1>
      </Card>
      <Dialog open={InvalidUrlDialog} onOpenChange={setInvalidUrlDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Erro ao buscar vídeo</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <p className='text-red-500'>URL inválida</p>
            <Button
              variant='destructive'
              onClick={() => setInvalidUrlDialog(false)}
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
