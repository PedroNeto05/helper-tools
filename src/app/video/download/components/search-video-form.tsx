import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoaderCircle } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { SearchVideoForm } from '../page';

interface SearchVideoCardProps {
  searchVideoForm: UseFormReturn<SearchVideoForm>;
  handleSearch: (data: SearchVideoForm) => void;
  handleSearchError: () => void;
  isFetching: boolean;
  className?: string;
}

export function SearchVideoCard({
  searchVideoForm,
  handleSearch,
  handleSearchError,
  isFetching,
  className,
}: SearchVideoCardProps) {
  return (
    <Card className={className}>
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
  );
}
