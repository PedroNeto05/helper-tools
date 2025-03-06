import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  resolution: z.number(),
  ext: z.string(),
});

type DownloadVideoOptionsForm = z.infer<typeof downloadVideoOptionsSchema>;

interface DownloadVideoFormProps {
  isFetching: boolean;
  isValidVideoUrl: boolean;
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

  const currentResolution = useWatch({
    control: downloadVideoOptionsForm.control,
    name: 'resolution',
    defaultValue: 0,
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

  function handleDownloadOptions(data: DownloadVideoOptionsForm) {
    console.log(data);
  }
  function handleDownloadOptionsError() {
    console.log('erro');
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
                disabled={isFetching}
                render={({ field }) => {
                  return (
                    <div className='flex space-x-4'>
                      <Input {...field} />
                      <Button
                        disabled={field.disabled}
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
        <CardHeader>
          <CardTitle className='text-center text-3xl'>
            Configurações de Download
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...downloadVideoOptionsForm}>
            <form
              className='space-y-4'
              onSubmit={downloadVideoOptionsForm.handleSubmit(
                handleDownloadOptions,
                handleDownloadOptionsError
              )}
            >
              <FormField
                control={downloadVideoOptionsForm.control}
                name='resolution'
                disabled={!isValidVideoUrl}
                render={({ field }) => (
                  <FormItem>
                    <Select {...field}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Selecione a resolução do vídeo' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='144'>144p</SelectItem>
                        <SelectItem value='240'>240p</SelectItem>
                        <SelectItem value='360'>360p</SelectItem>
                        <SelectItem value='480'>480p</SelectItem>
                        <SelectItem value='720'>720p</SelectItem>
                        <SelectItem value='1080'>1080p</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={downloadVideoOptionsForm.control}
                name='ext'
                disabled={!isValidVideoUrl || !currentResolution}
                render={({ field }) => (
                  <FormItem>
                    <Select {...field}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Selecione a extensão do vídeo' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={'1'}>1</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
