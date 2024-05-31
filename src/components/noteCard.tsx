import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PencilIcon, TrashIcon } from '@/lib/icons';
import { Note, NotePutBody } from '@/lib/schema';

import { AlertDialogFooter, AlertDialogHeader } from './ui/alert-dialog';

export function NoteCard({ note }: { note: Note }) {
  const queryClient = useQueryClient();
  const axios = useAxios();
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
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

  const updateNote = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: NotePutBody }) =>
      axios.put<Note>(`/notes/${id}`, note).then((res) => res.data),
    onMutate: async (note) => {
      await queryClient.cancelQueries({ queryKey: ['notes'] });
      const previousNotes = queryClient.getQueryData<Note[]>(['notes']);
      const updatedNotes = previousNotes?.map((n) => (n.id === note.id ? note : n));
      queryClient.setQueryData(['notes'], updatedNotes);
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

  const handleEdit = (note: Note) => {
    setEditNote(note);
  };

  const handleEditConfirm = () => {
    updateNote.mutate({ id: editNote!.id, note: { title: editNote!.title, content: editNote!.content } });
    setIsEditOpen(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditNote((prev) => ({ ...prev!, title: e.target.value }));
  };
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditNote((prev) => ({ ...prev!, content: e.target.value }));
  };

  return (
    <Card key={note.id}>
      <CardHeader>
        <CardTitle>{note.title}</CardTitle>
        <div className="flex items-center space-x-2">
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => handleEdit(note)}>
                <PencilIcon className="size-4" />
                <span className="sr-only">Edit</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit note</DialogTitle>
                <DialogDescription>Make changes to your note here.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input onChange={handleTitleChange} id="title" value={editNote?.title} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="content" className="text-right">
                    Content
                  </Label>
                  <Input onChange={handleContentChange} id="content" value={editNote?.content} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleEditConfirm}>Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
  );
}
