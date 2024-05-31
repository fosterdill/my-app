import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import useAxios from '@/app/hooks/useAxios';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Note, NotePutBody } from '@/lib/schema';

import { AlertDialogFooter, AlertDialogHeader } from './ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function Notes() {
  const queryClient = useQueryClient();
  const axios = useAxios();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { data: notes = [] } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => axios.get<Note[]>('/notes').then((res) => res.data),
  });
  const titleRef = useRef<HTMLInputElement>(null);

  const addNote = useMutation({
    mutationFn: async (note: NotePutBody) => axios.post<Note>('/notes', note).then((res) => res.data),
    onMutate: async (note) => {
      await queryClient.cancelQueries({ queryKey: ['notes'] });
      const previousNotes = queryClient.getQueryData<Note[]>(['notes']);
      queryClient.setQueryData(['notes'], (old: Note[]) => [...(old || []), note]);
      return { previousNotes };
    },
    onError: (err, variables, context) => {
      if (context) queryClient.setQueryData(['notes'], context.previousNotes);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => axios.delete(`/notes/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notes'] });
      const previousNotes = queryClient.getQueryData<Note[]>(['notes']);
      queryClient.setQueryData(['notes'], (old: Note[]) => old.filter((note) => note.id !== id));
      return { previousNotes };
    },
    onError: (err, variables, context) => {
      if (context) queryClient.setQueryData(['notes'], context.previousNotes);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const handleDelete = (id: string) => {
    deleteNote.mutate(id);
  };

  const handleAddNote = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    addNote.mutate({
      title,
      content,
    });

    setTitle('');
    setContent('');
    if (titleRef && titleRef.current) {
      titleRef.current.focus();
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };

  const handleEdit = (note: Note) => {
    console.log(note);
  };

  return (
    <div className="flex size-full h-full flex-col">
      <header className="sticky top-0 w-full bg-gray-100 px-6 py-4 dark:bg-gray-800">
        <h1 className="text-2xl font-bold">Notes</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <CardTitle>{note.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(note)}>
                    <PencilIcon className="size-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger>
                      {' '}
                      <Button variant="ghost" size="icon">
                        <TrashIcon className="size-4 stroke-red-500" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>You cannot undo deletion of a note.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={() => handleDelete(note.id)}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-gray-500 dark:text-gray-400">{note.content}</CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="sticky bottom-0 bg-gray-100 px-6 py-4 dark:bg-gray-800">
        <form className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              ref={titleRef}
              value={title}
              className="w-full"
              name="title"
              placeholder="Note title"
              onChange={handleTitleChange}
            />
          </div>
          <div className="flex-1">
            <Input
              value={content}
              className="w-full"
              name="content"
              placeholder="Note content"
              onChange={handleContentChange}
            />
          </div>
          <Button disabled={!title || !content} onClick={handleAddNote} type="submit">
            Add Note
          </Button>
        </form>
      </div>
    </div>
  );
}

function PencilIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function TrashIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
