'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { uploadSource } from '@/lib/api';

// Zod validation schema
const uploadFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, 'PDF file is required')
    .refine(
      (files) => files[0]?.type === 'application/pdf',
      'File must be a PDF'
    )
    .refine(
      (files) => files[0]?.size <= 10 * 1024 * 1024,
      'File size must be under 10MB'
    ),
});

type UploadFormValues = z.infer<typeof uploadFormSchema>;

interface UploadFormProps {
  vaultId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

/**
 * UploadForm component for uploading PDF sources
 * Features: file validation, progress indicator, error handling
 */
export function UploadForm({
  vaultId,
  isOpen,
  onClose,
  onSuccess,
  onError,
}: UploadFormProps) {
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: '',
    },
  });

  const onSubmit = async (data: UploadFormValues) => {
    try {
      setIsUploading(true);
      const file = data.file[0];
      await uploadSource(vaultId, file, data.title);

      // Reset form and close dialog
      form.reset();
      onClose();
      onSuccess();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload PDF Source</DialogTitle>
          <DialogDescription>
            Select a PDF file and provide a title for the source.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter source title"
                      {...field}
                      disabled={isUploading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>PDF File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => onChange(e.target.files)}
                      disabled={isUploading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
