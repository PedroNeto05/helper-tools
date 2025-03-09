'use client';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { open } from '@tauri-apps/plugin-dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { SearchVideoCard } from './components/search-video-form';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { invoke } from '@tauri-apps/api/core';
import { VideoDownloadOptionsForm } from './components/download-video-options-form';
import { VideoInformationCard } from './components/video-information-card';

type VideoFormat = {
  format_id: string;
  resolution: number;
  tbr: number | null;
  fps: number;
  ext: string;
};

type AudioFormat = {
  format_id: string;
  tbr: number | null;
  ext: string;
};

export type VideoInfo = {
  title: string;
  duration: number;
  thumbnail: string;
  video_formats: VideoFormat[];
  audio_formats: AudioFormat[];
};

const searchVideoFormSchema = z.object({
  url: z.string().url('Url Inválida'),
});

export type SearchVideoForm = z.infer<typeof searchVideoFormSchema>;

const downloadVideoOptionsSchema = z
  .object({
    resolution: z.coerce.number().optional(),
    ext: z.string().optional(),
    fps: z.coerce.number().optional(),
    audioOnly: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.audioOnly) {
      if (!data.resolution) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['resolution'],
          message: 'A Resolução é obrigatória',
        });
      }
      if (!data.fps) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['fps'],
          message: 'A Extensão é obrigatória',
        });
      }
      if (!data.ext) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ext'],
          message: 'O FPS é obrigatório',
        });
      }
    }
  });

export type DownloadVideoOptionsForm = z.infer<
  typeof downloadVideoOptionsSchema
>;

export default function VideoDownloader() {
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isValidVideoUrl, setIsValidVideoUrl] = useState<boolean>(false);
  const [audioOnly, setAudioOnly] = useState<boolean>(false);
  const [dialogError, setDialogError] = useState<boolean>(false);
  const [dialogErrorMessage, setDialogErrorMessage] = useState<string>('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [validUrl, setValidUrl] = useState('');
  const [downloadPath, setDownloadPath] = useState<string>('');

  const searchVideoForm = useForm<SearchVideoForm>({
    resolver: zodResolver(searchVideoFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      url: '',
    },
  });

  const downloadVideoOptionsForm = useForm({
    resolver: zodResolver(downloadVideoOptionsSchema),
    mode: 'onSubmit',
    defaultValues: {
      resolution: 0,
      ext: '',
    },
  });
  const currentResolution = Number(
    useWatch({
      control: downloadVideoOptionsForm.control,
      name: 'resolution',
      defaultValue: 0,
    })
  );

  const currentExt = useWatch({
    control: downloadVideoOptionsForm.control,
    name: 'ext',
    defaultValue: '',
  });

  async function handleSearch(data: SearchVideoForm) {
    downloadVideoOptionsForm.reset();
    setIsFetching(true);
    setValidUrl('');
    setVideoInfo(null);
    setIsValidVideoUrl(false);
    try {
      await invoke('validate_url', { url: data.url });
    } catch (e) { // eslint-disable-line
      setDialogErrorMessage('Url Inválida');
      setDialogError(true);
      setIsFetching(false);
      return;
    }
    setValidUrl(data.url);
    await getVideoInfo(data.url);
    setIsFetching(false);
    setIsValidVideoUrl(true);
  }

  function handleSearchError() {
    const errors = searchVideoForm.formState.errors;
    if (!errors.url) return;
    if (errors.url?.message) {
      downloadVideoOptionsForm.reset();
      setVideoInfo(null);
      setDialogErrorMessage(errors.url.message);
      setDialogError(true);
      return;
    }
  }

  async function getVideoInfo(url: string) {
    try {
      const videoInfo: VideoInfo = await invoke('get_video_info', {
        url,
      });
      setVideoInfo(videoInfo);
    } catch (e) { // eslint-disable-line
      setDialogErrorMessage('Erro ao buscar as informações do vídeo');
      setDialogError(true);
    }
  }

  function handleDownloadOptions(data: DownloadVideoOptionsForm) {
    console.log(data);
  }
  function handleDownloadOptionsError() {
    const errors = downloadVideoOptionsForm.formState.errors;
    const firstError = Object.values(errors).find(
      (error) => error?.message
    )?.message;
    if (!firstError) return;
    setDialogErrorMessage(firstError);

    setDialogError(true);
  }

  return (
    <div className='flex h-full space-x-5'>
      <div className='flex flex-1 flex-col space-y-5'>
        <SearchVideoCard
          searchVideoForm={searchVideoForm}
          handleSearch={handleSearch}
          handleSearchError={handleSearchError}
          isFetching={isFetching}
        />
        <VideoInformationCard
          videoInfo={videoInfo}
          className='flex-1 items-center'
        />

        <VideoDownloadOptionsForm
          videoInfo={videoInfo}
          isValidVideoUrl={isValidVideoUrl}
          downloadVideoOptionsForm={downloadVideoOptionsForm}
          handleDownloadOptions={handleDownloadOptions}
          handleDownloadOptionsError={handleDownloadOptionsError}
          currentExt={currentExt}
          currentResolution={currentResolution}
          className='flex-10'
        />
      </div>
      <div className='flex flex-1 flex-col space-y-5'>
        <Card className='flex h-full flex-col'>
          <CardHeader className='text-center'>
            <CardTitle className='text-3xl'>Fila de Download</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-1 flex-col overflow-hidden'>
            <ScrollArea className='flex-1 overflow-y-auto'>
              <div className='absolute flex w-full flex-col space-y-4'></div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className='flex-1'>
          <CardHeader className='text-center text-3xl'>
            <CardTitle>Pasta de Download</CardTitle>
          </CardHeader>
          <CardContent className='flex space-x-4'>
            <Input
              value={downloadPath}
              placeholder='Caminho da pasta de download'
              disabled
            />
            <Button
              disabled
              onClick={async () => {
                const selectedPath = await open({
                  directory: true,
                  multiple: false,
                });
                if (selectedPath) {
                  setDownloadPath(selectedPath);
                }
              }}
            >
              Selecionar Pasta de Download
            </Button>
          </CardContent>
          <CardFooter>
            <Button
              className='w-full p-6'
              disabled={!isValidVideoUrl || !downloadPath}
            >
              Baixar Fila
            </Button>
          </CardFooter>
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
