import { LoaderCircle } from 'lucide-react';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from './ui/form';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { invoke } from '@tauri-apps/api/core';

const formSchema = z.object({
  url: z.string().url(),
  quality: z.string().optional(),
  audioOnly: z.boolean().optional(),
  format: z.string().optional(),
});

type DownloadVideoFormProps = {
  isFetching: boolean;
  validUrl: boolean;
  audioOnly: boolean;
  setAudioOnly: (value: boolean) => void;
  setIsFetching: (value: boolean) => void;
  setValidUrl: (value: boolean) => void;
  setInvalidUrlDialog: (value: boolean) => void;
};

export function DownloadVideoForm({
  audioOnly,
  isFetching,
  setAudioOnly,
  validUrl,
  setIsFetching,
  setValidUrl,
  setInvalidUrlDialog,
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
    const { url } = form.getValues();
    setIsFetching(true);
    try {
      await invoke('validate_url', { url });
      setValidUrl(true);
    } catch (error) { // eslint-disable-line
      setInvalidUrlDialog(true);
      setValidUrl(false);
    }
    setIsFetching(false);
  }

  async function getVideoInfo(url: string) {
    console.log('Getting video info from:', url);
  }

  return (
    <Form {...form}>
      <Card className='flex flex-1 items-center p-4'>
        <FormField
          control={form.control}
          name='url'
          render={({ field }) => (
            <FormItem className='w-full'>
              <FormLabel>URL do vídeo</FormLabel>
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
      </Card>
      <Card className='flex flex-1 items-center p-4'>
        <CardHeader className='text-center'>
          <CardTitle className='text-3xl'>Informações do Vídeo</CardTitle>
        </CardHeader>
      </Card>
      <Card className='flex flex-10 flex-col justify-between space-y-4 p-4'>
        <div>
          <CardHeader className='text-center'>
            <CardTitle className='text-3xl'>
              Configurações de Download
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4 p-0'>
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
                        <SelectItem value='1080p 60fps' className='p-4'>
                          1080p 60fps
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
          </CardContent>
        </div>
        <CardFooter className='p-0'>
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
