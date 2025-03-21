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
import { SearchVideoCard } from './components/search-video-form';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { invoke } from '@tauri-apps/api/core';
import { VideoDownloadOptionsForm } from './components/download-video-options-form';
import { VideoInformationCard } from './components/video-information-card';
import { DownloadVideoQueue } from './components/download-video-queue';

type VideoFormat = {
  format_id: string;
  resolution: number;
  tbr: number;
  fps: number;
  ext: string;
};

type AudioFormat = {
  format_id: string;
  tbr: number;
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
    audioOnly: z.boolean().optional(),
    audioExt: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.audioOnly) {
      if (!data.resolution) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['resolution'],
          message: 'A Resolução é obrigatória',
        });
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
    } else {
      if (!data.audioExt) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['audioExt'],
          message: 'A Extensão do áudio é obrigatória',
        });
      }
    }
  });

export type DownloadVideoOptionsForm = z.infer<
  typeof downloadVideoOptionsSchema
>;

export type DownloadVideoItem = {
  format_id: string;
  url: string;
  title: string;
  thumbnail: string;
};

export default function VideoDownloader() {
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isValidVideoUrl, setIsValidVideoUrl] = useState<boolean>(false);
  const [dialogError, setDialogError] = useState<boolean>(false);
  const [dialogErrorMessage, setDialogErrorMessage] = useState<string>('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [validUrl, setValidUrl] = useState('');
  const [downloadPath, setDownloadPath] = useState<string>('');
  const [downloadQueue, setDownloadQueue] = useState<DownloadVideoItem[]>([]);

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
  const isAudioOnly = useWatch({
    control: downloadVideoOptionsForm.control,
    name: 'audioOnly',
    defaultValue: false,
  });

  async function handleSearch(data: SearchVideoForm) {
    downloadVideoOptionsForm.reset();
    setIsFetching(true);
    setValidUrl('');
    setVideoInfo(null);
    setIsValidVideoUrl(false);
    try {
      await invoke('validate_url', { url: data.url });
    } catch (e) {
      // eslint-disable-line
      setDialogErrorMessage('Url Inválida');
      setDialogError(true);
      setIsFetching(false);
      return;
    }
    setValidUrl(data.url);
    const validVideoInfo = await getVideoInfo(data.url);
    setIsFetching(false);
    setIsValidVideoUrl(validVideoInfo);
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
      return true;
    } catch (e) {
      // eslint-disable-line
      setDialogErrorMessage('Erro ao buscar as informações do vídeo');
      setDialogError(true);
      return false;
    }
  }

  function handleDownloadOptions(data: DownloadVideoOptionsForm) {
    const videoAlreadyInQueue = downloadQueue.find(
      (item) => item.url === validUrl
    );

    if (videoAlreadyInQueue) {
      setDialogErrorMessage('Vídeo já está na fila de download');
      setDialogError(true);
      return;
    }

    if (data.audioOnly) {
      const filteredAudioFormats = videoInfo?.audio_formats.filter(
        (format) => format.ext === data.audioExt
      ) as AudioFormat[];

      if (filteredAudioFormats.length === 1) {
        setDownloadQueue((prevQueue) => [
          ...prevQueue,
          {
            format_id: filteredAudioFormats[0].format_id,
            url: validUrl,
            thumbnail: videoInfo?.thumbnail || '',
            title: videoInfo?.title || '',
          },
        ]);
        setVideoInfo(null);
        setValidUrl('');
        setIsValidVideoUrl(false);
        downloadVideoOptionsForm.reset();
        searchVideoForm.reset();
        return;
      }

      const bestFormat = filteredAudioFormats.reduce((prev, current) =>
        current.tbr > prev.tbr ? current : prev
      );

      setDownloadQueue((prevQueue) => [
        ...prevQueue,
        {
          format_id: bestFormat.format_id,
          url: validUrl,
          thumbnail: videoInfo?.thumbnail || '',
          title: videoInfo?.title || '',
        },
      ]);
      setVideoInfo(null);
      setValidUrl('');
      setIsValidVideoUrl(false);
      downloadVideoOptionsForm.reset();
      searchVideoForm.reset();
      return;
    }

    const videoFormats = videoInfo?.video_formats.filter(
      (format) =>
        format.ext === data.ext && format.resolution === data.resolution
    ) as VideoFormat[];

    if (videoFormats.length === 1) {
      setDownloadQueue((prevQueue) => [
        ...prevQueue,
        {
          format_id: videoFormats[0].format_id,
          url: validUrl,
          thumbnail: videoInfo?.thumbnail || '',
          title: videoInfo?.title || '',
        },
      ]);
      setVideoInfo(null);
      setValidUrl('');
      setIsValidVideoUrl(false);
      downloadVideoOptionsForm.reset();
      searchVideoForm.reset();
      return;
    }

    const bestFormat = videoFormats.reduce((prev, current) =>
      current.tbr > prev.tbr ? current : prev
    );

    setDownloadQueue((prevQueue) => [
      ...prevQueue,
      {
        format_id: bestFormat.format_id,
        url: validUrl,
        thumbnail: videoInfo?.thumbnail || '',
        title: videoInfo?.title || '',
      },
    ]);

    setVideoInfo(null);
    setValidUrl('');
    setIsValidVideoUrl(false);
    downloadVideoOptionsForm.reset();
    searchVideoForm.reset();
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
          isAudioOnly={isAudioOnly}
          className='flex-10'
        />
      </div>
      <div className='flex flex-1 flex-col space-y-5'>
        <DownloadVideoQueue
          videoQueue={downloadQueue}
          setVideoQueue={setDownloadQueue}
        />
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
