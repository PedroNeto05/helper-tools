import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  Form,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DownloadVideoOptionsForm, VideoInfo } from '../page';
import { UseFormReturn } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { useEffect } from 'react';

interface DownloadVideoFormProps {
  downloadVideoOptionsForm: UseFormReturn<DownloadVideoOptionsForm>;
  handleDownloadOptions: (data: DownloadVideoOptionsForm) => void;
  handleDownloadOptionsError: () => void;
  isValidVideoUrl: boolean;
  videoInfo: VideoInfo | null;
  currentResolution: number;
  currentExt?: string;
  isAudioOnly?: boolean;
  className?: string;
}

export function VideoDownloadOptionsForm({
  downloadVideoOptionsForm,
  handleDownloadOptions,
  handleDownloadOptionsError,
  isValidVideoUrl,
  videoInfo,
  currentResolution,
  currentExt,
  isAudioOnly,
  className,
}: DownloadVideoFormProps) {
  useEffect(() => {
    if (isAudioOnly) {
      downloadVideoOptionsForm.resetField('resolution');
      downloadVideoOptionsForm.resetField('ext');
      downloadVideoOptionsForm.resetField('fps');
      return;
    }
    downloadVideoOptionsForm.resetField('audioExt');
  }, [isAudioOnly, downloadVideoOptionsForm]);

  return (
    <Card className={className}>
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
              name='audioOnly'
              render={({ field }) => (
                <FormItem className='border-border flex items-center justify-between rounded-md border p-2'>
                  <FormLabel>Apenas Áudio</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      disabled={
                        !isValidVideoUrl ||
                        videoInfo?.audio_formats.length === 0
                      }
                      defaultChecked={false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={downloadVideoOptionsForm.control}
              name='audioExt'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Extensão do Áudio</FormLabel>
                  <Select
                    {...field}
                    disabled={!isValidVideoUrl || !isAudioOnly}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Selecione a extensão do áudio' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from(
                        new Set(
                          videoInfo?.audio_formats.map((format) => format.ext)
                        )
                      ).map((ext) => {
                        return (
                          <SelectItem key={ext} value={ext}>
                            {ext}
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
              name='resolution'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resolução</FormLabel>
                  <Select
                    {...field}
                    onValueChange={(value) => {
                      field.onChange(value);
                      downloadVideoOptionsForm.resetField('fps');
                      downloadVideoOptionsForm.resetField('ext');
                    }}
                    disabled={
                      !isValidVideoUrl ||
                      isAudioOnly ||
                      videoInfo?.video_formats.length === 0
                    }
                  >
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
                  <FormLabel>Extensão</FormLabel>
                  <Select
                    {...field}
                    disabled={
                      !isValidVideoUrl || !currentResolution || isAudioOnly
                    }
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
                  <FormLabel>Fps</FormLabel>

                  <Select
                    {...field}
                    disabled={!isValidVideoUrl || !currentExt || isAudioOnly}
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
            <Button
              type='submit'
              className='w-full'
              disabled={!isValidVideoUrl}
            >
              Adicionar a fila
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
