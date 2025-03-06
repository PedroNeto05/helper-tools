import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VideoInfo } from '../page';
import { invoke } from '@tauri-apps/api/core';
import { LoaderCircle } from 'lucide-react';

const searchVideoFormSchema = z.object({
  url: z.string().url('Url Inválida'),
});

type SearchVideoForm = z.infer<typeof searchVideoFormSchema>;

interface DownloadVideoFormProps {
  isFetching: boolean;
  setIsFetching: (value: boolean) => void;
  setDialogError: (value: boolean) => void;
  setDialogErrorMessage: (value: string) => void;
  setCurrentUrl: (value: string) => void;
  setVideoInfo: (value: VideoInfo | null) => void;
}

export function DownloadVideoForm({
  isFetching,
  setIsFetching,
  setDialogError,
  setDialogErrorMessage,
  setVideoInfo,
  setCurrentUrl,
}: DownloadVideoFormProps) {
  const searchVideoForm = useForm({
    resolver: zodResolver(searchVideoFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      url: '',
    },
    mode: 'onSubmit',
  });

  async function handleSearch(data: SearchVideoForm) {
    setIsFetching(true);
    setCurrentUrl('');
    setVideoInfo(null);
    try {
      await invoke('validate_url', { url: data.url });
    } catch (e) { // eslint-disable-line
      setDialogError(true);
      setDialogErrorMessage('Url Inválida');
      return;
    }
    setCurrentUrl(data.url);
    await getVideoInfo(data.url);
    setIsFetching(false);
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
    </div>
  );
}
