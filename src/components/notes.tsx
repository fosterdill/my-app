import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRef, useState } from 'react';

import useAxios from '@/app/hooks/useAxios';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uiRoutes } from '@/constants/uiRoutes';
import { Note, NotePutBody } from '@/lib/schema';
import { cn } from '@/lib/utils';

import { NoteCard } from './noteCard';

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

  const notesCards = (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
    </div>
  );

  const createNotesMessage = (
    <div className="flex flex-1 items-center justify-center p-6">
      <p>Create a note.</p>
    </div>
  );

  return (
    <div className="flex size-full h-full flex-col">
      <header className="sticky top-0 flex w-full flex-row justify-between bg-gray-100 px-6 py-4 dark:bg-gray-800">
        <h1 className="text-2xl font-bold">Notes</h1>
        <Link className={cn(buttonVariants({ variant: 'outline' }), 'mr-2')} href={uiRoutes.signOut}>
          Sign out
        </Link>
      </header>
      {notes.length ? notesCards : createNotesMessage}
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
