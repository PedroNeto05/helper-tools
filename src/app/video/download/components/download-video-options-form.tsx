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

interface DownloadVideoFormProps {
  downloadVideoOptionsForm: UseFormReturn<DownloadVideoOptionsForm>;
  handleDownloadOptions: (data: DownloadVideoOptionsForm) => void;
  handleDownloadOptionsError: () => void;
  isValidVideoUrl: boolean;
  videoInfo: VideoInfo | null;
  currentResolution: number;
  currentExt: string;
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
  className,
}: DownloadVideoFormProps) {
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
              name='resolution'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resolução</FormLabel>
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
                  <FormLabel>Extensão</FormLabel>
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
                  <FormLabel>Fps</FormLabel>

                  <Select {...field} disabled={!isValidVideoUrl || !currentExt}>
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
