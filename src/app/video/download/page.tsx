'use client';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { LoaderCircle } from 'lucide-react';

const formSchema = z.object({
  url: z.string().url(),
});

export default function VideoDownloader() {
  const [isFeatching, setIsFeatching] = useState<boolean>(false);
  const [validUrl, setValidUrl] = useState<boolean>(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
    },
  });
  return (
    <div className='flex h-full space-x-5'>
      <div className='flex flex-1 flex-col space-y-5'>
        <Form {...form}>
          <Card className='flex flex-1 items-center p-4'>
            <FormField
              control={form.control}
              name='url'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormControl>
                    <div className='flex w-full space-x-5'>
                      <Input
                        {...field}
                        placeholder='https://exemplo.com'
                        className='p-6'
                      />
                      <Button type='button' className='cursor-pointer p-6'>
                        {isFeatching ? (
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
          <Card className='flex-10 p-4'>
            <FormField
              control={form.control}
              name='quality'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualidade do Vídeo</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className='w-full rounded-md border p-2'
                      disabled={!validUrl}
                    >
                      <option value=''>Selecione a qualidade</option>
                    </select>
                  </FormControl>
                  <FormDescription>
                    Selecione a qualidade desejada para o download
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
        </Form>
      </div>
      <Card className='flex-1 p-4'>
        <h1>fila de downloads e baixar a fila</h1>
      </Card>
    </div>
  );
}
