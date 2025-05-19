import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
};

const NOTES_KEY = 'NOTES';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(NOTES_KEY).then(data => {
      if (data) setNotes(JSON.parse(data));
      setLoading(false);
    });
  }, []);

  const saveNotes = async (newNotes: Note[]) => {
    setNotes(newNotes);
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(newNotes));
  };

  const addNote = async (note: Note) => {
    const newNotes = [note, ...notes];
    await saveNotes(newNotes);
  };

  const updateNote = async (note: Note) => {
    const newNotes = notes.map(n => n.id === note.id ? note : n);
    await saveNotes(newNotes);
  };

  const deleteNote = async (id: string) => {
    const newNotes = notes.filter(n => n.id !== id);
    await saveNotes(newNotes);
  };

  return { notes, loading, addNote, updateNote, deleteNote };
}
