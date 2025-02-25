import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { invoke } from '@tauri-apps/api/core';
import { VideoInfo } from '@/app/video/download/page';

interface DownloadVideoFormProps {
  isFetching: boolean;
  validUrl: boolean;
  audioOnly: boolean;
  videoInfo: VideoInfo | null;
  currentUrl: string;
  setAudioOnly: (value: boolean) => void;
  setIsFetching: (value: boolean) => void;
  setValidUrl: (value: boolean) => void;
  setInvalidUrlDialog: (value: boolean) => void;
  setDialogErrorMessage: (value: string) => void;
  setVideoInfo: (value: VideoInfo | null) => void;
  setCurrentUrl: (value: string) => void;
}

const searchVideoFormSchema = z.object({
  url: z.string().url(),
});

type SearchVideoForm = z.infer<typeof searchVideoFormSchema>;

const downloadVideoConfigFormSchema = z.object({
  resolution: z.string().optional(),
  formatId: z.string().optional(),
  ext: z.string().optional(),
});

type DownloadVideoConfigForm = z.infer<typeof downloadVideoConfigFormSchema>;

export function DownloadVideoForm({
  audioOnly,
  isFetching,
  videoInfo,
  setAudioOnly,
  validUrl,
  setCurrentUrl,
  currentUrl,
  setIsFetching,
  setValidUrl,
  setInvalidUrlDialog,
  setDialogErrorMessage,
  setVideoInfo,
}: DownloadVideoFormProps) {
  const searchVideoForm = useForm<SearchVideoForm>({
    resolver: zodResolver(searchVideoFormSchema),
    defaultValues: {
      url: '',
    },
  });

  const downloadVideoConfigForm = useForm<DownloadVideoConfigForm>({
    resolver: zodResolver(downloadVideoConfigFormSchema),
    defaultValues: {
      resolution: '',
      formatId: '',
      ext: '',
    },
  });
  function handleSearchVideoFormSubmit(data: SearchVideoForm) {
    console.log(data);
    setCurrentUrl(data.url);
    validateUrl(data.url);
  }

  async function validateUrl(url: string) {
    setVideoInfo(null);
    setIsFetching(true);
    downloadVideoConfigForm.reset();
    try {
      await invoke('validate_url', { url });
      await getVideoInfo(url);
      setValidUrl(true);
    } catch (error) { // eslint-disable-line
      setInvalidUrlDialog(true);
      setDialogErrorMessage('URL inválida');
      setValidUrl(false);
      setVideoInfo(null);
      downloadVideoConfigForm.reset();
    }
    setIsFetching(false);
  }

  async function getVideoInfo(url: string) {
    try {
      const videoInfo: VideoInfo = await invoke('get_video_info', {
        url,
      });
      setVideoInfo(videoInfo);
    } catch (error) { // eslint-disable-line
      setInvalidUrlDialog(true);
      setDialogErrorMessage('Erro ao obter informações do vídeo');
      setValidUrl(false);
    }
  }

  return (
    <div className='h-full space-y-5'>
      <Card>
        <CardHeader>
          <CardTitle className='text-center'>
            <h1 className='text-3xl'>Url do video</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...searchVideoForm}>
            <form
              onSubmit={searchVideoForm.handleSubmit(
                handleSearchVideoFormSubmit
              )}
            >
              <FormField
                control={searchVideoForm.control}
                name='url'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className='flex space-x-2'>
                        <Input
                          className='p-6'
                          placeholder='https://example.com'
                          disabled={isFetching}
                          {...field}
                        />
                        <Button
                          type='submit'
                          className='cursor-pointer p-6'
                          disabled={isFetching}
                        >
                          {isFetching ? (
                            <LoaderCircle className='animate-spin' />
                          ) : (
                            'Pesquisar'
                          )}
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <Form {...downloadVideoConfigForm}>
          <CardHeader>
            <CardTitle className='text-center'>
              <h1 className='text-3xl'>Download</h1>
            </CardTitle>
          </CardHeader>
        </Form>
      </Card>
    </div>
  );
}
