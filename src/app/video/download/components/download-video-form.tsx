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

const formSchema = z.object({
  url: z.string().url(),
  quality: z.string().optional(),
  audioOnly: z.boolean().optional(),
  format: z.string().optional(),
});

interface DownloadVideoFormProps {
  isFetching: boolean;
  validUrl: boolean;
  audioOnly: boolean;
  videoInfo: VideoInfo | null;
  setAudioOnly: (value: boolean) => void;
  setIsFetching: (value: boolean) => void;
  setValidUrl: (value: boolean) => void;
  setInvalidUrlDialog: (value: boolean) => void;
  setDialogErrorMessage: (value: string) => void;
  setVideoInfo: (value: VideoInfo | null) => void;
}

export function DownloadVideoForm({
  audioOnly,
  isFetching,
  videoInfo,
  setAudioOnly,
  validUrl,
  setIsFetching,
  setValidUrl,
  setInvalidUrlDialog,
  setDialogErrorMessage,
  setVideoInfo,
}: DownloadVideoFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
      quality: '',
      audioOnly: false,
      format: '',
    },
  });

  async function validateUrl() {
    setVideoInfo(null);
    setIsFetching(true);
    const { url } = form.getValues();
    try {
      await invoke('validate_url', { url });
      await getVideoInfo(url);
      setValidUrl(true);
    } catch (error) { // eslint-disable-line
      setInvalidUrlDialog(true);
      setDialogErrorMessage('URL inválida');
      setValidUrl(false);
      setVideoInfo(null);
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
    <Form {...form}>
      <Card className='flex-1'>
        <CardHeader className='text-center'>
          <CardTitle className='text-3xl'>URL do Vídeo</CardTitle>
        </CardHeader>
        <CardContent className='w-full'>
          <FormField
            control={form.control}
            name='url'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <div className='flex space-x-5'>
                    <Input
                      {...field}
                      placeholder='https://exemplo.com'
                      className='p-6'
                    />
                    <Button
                      type='button'
                      className='cursor-pointer p-6'
                      disabled={isFetching}
                      onClick={validateUrl}
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
        </CardContent>
      </Card>

      <Card className='flex flex-10 flex-col justify-between'>
        <div>
          <CardHeader className='text-center'>
            <CardTitle className='text-3xl'>
              Configurações de Download
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='audioOnly'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel>Baixar apenas o áudio</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      disabled={!validUrl}
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        setAudioOnly(checked);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='quality'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualidade do Vídeo</FormLabel>
                  <FormControl>
                    <Select
                      disabled={!validUrl || audioOnly}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger className='w-full p-6'>
                        <SelectValue placeholder='Selecione a qualidade' />
                      </SelectTrigger>
                      <SelectContent>
                        {videoInfo?.formats.map((format, index) => (
                          <SelectItem
                            key={index}
                            value={format.resolution}
                            className='p-4'
                          >
                            {format.resolution}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='format'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Formato do Vídeo</FormLabel>
                  <FormControl>
                    <Select
                      disabled={!validUrl || audioOnly}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger className='w-full p-6'>
                        <SelectValue placeholder='Selecione o formato' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='mp4' className='p-4'>
                          MP4
                        </SelectItem>
                        <SelectItem value='mov' className='p-4'>
                          MOV
                        </SelectItem>
                        <SelectItem value='webm' className='p-4'>
                          WebM
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='format'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Formato do Audio</FormLabel>
                  <FormControl>
                    <Select
                      disabled={!validUrl || !audioOnly}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger className='w-full p-6'>
                        <SelectValue placeholder='Selecione o formato' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='mp4' className='p-4'>
                          MP4
                        </SelectItem>
                        <SelectItem value='mov' className='p-4'>
                          MOV
                        </SelectItem>
                        <SelectItem value='webm' className='p-4'>
                          WebM
                        </SelectItem>
                        <SelectItem value='webm' className='p-4'>
                          WebM
                        </SelectItem>
                        <SelectItem value='webm' className='p-4'>
                          WebM
                        </SelectItem>
                        <SelectItem value='webm' className='p-4'>
                          WebM
                        </SelectItem>
                        <SelectItem value='webm' className='p-4'>
                          WebM
                        </SelectItem>
                        <SelectItem value='webm' className='p-4'>
                          WebM
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </div>
        <CardFooter className=''>
          <Button
            type='submit'
            disabled={!validUrl}
            className='w-full cursor-pointer p-6'
          >
            Adicionar à fila
          </Button>
        </CardFooter>
      </Card>
    </Form>
  );
}
