import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useNotes } from '@/components/useNotes';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

export default function NotesScreen() {
  const { notes, addNote, deleteNote } = useNotes();
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleAdd = () => {
    if (!title.trim()) return;
    addNote({ id: uuidv4(), title, content, createdAt: Date.now() });
    setTitle('');
    setContent('');
  };

  return (
    <View className="flex-1 bg-white dark:bg-black p-4">
      <Text className="text-2xl font-bold mb-2 text-black dark:text-white">{t('notes')}</Text>
      <TextInput
        className="border rounded p-2 mb-2 bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
        placeholder={t('title')}
        value={title}
        onChangeText={setTitle}
        placeholderTextColor="#888"
      />
      <TextInput
        className="border rounded p-2 mb-2 bg-gray-100 dark:bg-gray-800 text-black dark:text-white"
        placeholder={t('content')}
        value={content}
        onChangeText={setContent}
        placeholderTextColor="#888"
        multiline
      />
      <TouchableOpacity className="bg-blue-500 rounded p-2 mb-4" onPress={handleAdd}>
        <Text className="text-white text-center">{t('add')}</Text>
      </TouchableOpacity>
      <FlatList
        data={notes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View className="mb-2 p-3 rounded bg-white/60 dark:bg-gray-900/60 shadow">
            <Text className="font-bold text-lg text-black dark:text-white">{item.title}</Text>
            <Text className="text-gray-700 dark:text-gray-300 mb-2">{item.content}</Text>
            <TouchableOpacity onPress={() => deleteNote(item.id)}>
              <Text className="text-red-500">{t('delete')}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
