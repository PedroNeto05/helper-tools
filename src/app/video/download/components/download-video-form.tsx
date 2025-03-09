import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VideoInfo } from '../page';
import { invoke } from '@tauri-apps/api/core';
import { LoaderCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const searchVideoFormSchema = z.object({
  url: z.string().url('Url Inválida'),
});

type SearchVideoForm = z.infer<typeof searchVideoFormSchema>;

const downloadVideoOptionsSchema = z.object({
  resolution: z.coerce.number().min(1, 'A Resolução é obrigatória'),
  ext: z.string().nonempty({ message: 'A Extensão é obrigatória' }),
  fps: z.coerce.number({ message: 'O FPS é obrigatório' }),
});

type DownloadVideoOptionsForm = z.infer<typeof downloadVideoOptionsSchema>;

interface DownloadVideoFormProps {
  isFetching: boolean;
  isValidVideoUrl: boolean;
  videoInfo: VideoInfo | null;
  setIsFetching: (value: boolean) => void;
  setIsValidVideoUrl: (value: boolean) => void;
  setDialogError: (value: boolean) => void;
  setDialogErrorMessage: (value: string) => void;
  setValidUrl: (value: string) => void;
  setVideoInfo: (value: VideoInfo | null) => void;
}

export function DownloadVideoForm({
  isFetching,
  setIsFetching,
  setDialogError,
  setDialogErrorMessage,
  setVideoInfo,
  setValidUrl,
  setIsValidVideoUrl,
  isValidVideoUrl,
  videoInfo,
}: DownloadVideoFormProps) {
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
      setDialogError(true);
      setDialogErrorMessage('Url Inválida');
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
    setDialogError(true);
    if (errors.url?.message) {
      setDialogErrorMessage(errors.url.message);
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
      setDialogError(true);
      setDialogErrorMessage('Erro ao buscar as informações do vídeo');
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
    <div className='space-y-5'>
      <Card>
        <CardHeader>
          <CardTitle className='text-center text-3xl'>Url do Vídeo</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...searchVideoForm}>
            <form
              onSubmit={searchVideoForm.handleSubmit(
                handleSearch,
                handleSearchError
              )}
            >
              <FormField
                control={searchVideoForm.control}
                name='url'
                render={({ field }) => {
                  return (
                    <div className='flex space-x-4'>
                      <Input {...field} disabled={isFetching} />
                      <Button
                        disabled={isFetching}
                        type='submit'
                        className='cursor-pointer'
                      >
                        {isFetching ? (
                          <LoaderCircle className='animate-spin' />
                        ) : (
                          'Pesquisar'
                        )}
                      </Button>
                    </div>
                  );
                }}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <Form {...downloadVideoOptionsForm}>
          <form
            onSubmit={downloadVideoOptionsForm.handleSubmit(
              handleDownloadOptions,
              handleDownloadOptionsError
            )}
          >
            <CardHeader>
              <CardTitle className='text-center text-3xl'>
                Configurações de Download
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <FormField
                control={downloadVideoOptionsForm.control}
                name='resolution'
                render={({ field }) => (
                  <FormItem>
                    <Select {...field} disabled={!isValidVideoUrl}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Selecione a resolução do vídeo' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from(
                          new Set(
                            videoInfo?.video_formats.map(
                              (format) => format.resolution
                            )
                          )
                        )
                          .reverse()
                          .map((res) => {
                            return (
                              <SelectItem key={res} value={res.toString()}>
                                {res}p
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={downloadVideoOptionsForm.control}
                name='ext'
                render={({ field }) => (
                  <FormItem>
                    <Select
                      {...field}
                      disabled={!isValidVideoUrl || !currentResolution}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Selecione a extensão do vídeo' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currentResolution &&
                          Array.from(
                            new Set(
                              videoInfo?.video_formats
                                .filter(
                                  (format) =>
                                    format.resolution === currentResolution
                                )
                                .map((format) => format.ext)
                            )
                          ).map((ext) => (
                            <SelectItem key={ext} value={ext}>
                              {ext}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={downloadVideoOptionsForm.control}
                name='fps'
                render={({ field }) => (
                  <FormItem>
                    <Select
                      {...field}
                      disabled={!isValidVideoUrl || !currentExt}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Selecione o fps do vídeo' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currentExt &&
                          Array.from(
                            new Set(
                              videoInfo?.video_formats
                                .filter(
                                  (format) =>
                                    format.resolution === currentResolution &&
                                    format.ext === currentExt
                                )
                                .map((format) => format.fps)
                            )
                          ).map((fps) => (
                            <SelectItem key={fps} value={fps.toString()}>
                              {fps}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type='submit' className='w-full'>
                Adicionar a fila
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
