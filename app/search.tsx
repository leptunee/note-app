// 搜索页面组件
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  useColorScheme,
  TouchableOpacity,
  ScrollView,
  Pressable,
  StatusBar,
  FlatList
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useNotes } from '@/src/hooks/useNotes';
import Colors from '@/constants/Colors';

export default function SearchScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { notes, categories } = useNotes();
  const colorScheme = useColorScheme() ?? 'light';
  const searchInputRef = useRef<TextInput>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');

  // 页面加载时自动聚焦搜索框
  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // 计算的颜色值
  const colors = useMemo(() => ({
    tint: Colors[colorScheme].tint,
    text: colorScheme === 'dark' ? '#fff' : '#000',
    background: colorScheme === 'dark' ? '#000' : '#fff',
    cardBackground: colorScheme === 'dark' ? '#222' : '#f6f6f6',
    secondaryText: colorScheme === 'dark' ? '#ccc' : '#666',
    tertiaryText: colorScheme === 'dark' ? '#888' : '#999',
    searchHighlight: colorScheme === 'dark' ? '#ff6b35' : '#ff3300',
    border: colorScheme === 'dark' ? '#333' : '#e0e0e0',
  }), [colorScheme]);

  // 高亮搜索词的函数
  const highlightText = useCallback((text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '**$1**');
  }, []);

  // 移除HTML标签并截断内容
  const truncateContent = useCallback((text: string, maxLength: number = 120) => {
    const plainText = text.replace(/<[^>]*>/g, '').trim();
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  }, []);

  // 渲染高亮文本
  const renderHighlightedText = useCallback((text: string, query: string, style: any) => {
    if (!query.trim()) {
      return <Text style={style}>{text}</Text>;
    }

    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    
    return (
      <Text style={style}>
        {parts.map((part, index) => {
          const isHighlight = part.toLowerCase() === query.toLowerCase();
          return (
            <Text
              key={index}
              style={isHighlight ? { backgroundColor: colors.searchHighlight, color: '#fff' } : {}}
            >
              {part}
            </Text>
          );
        })}
      </Text>
    );
  }, [colors.searchHighlight]);
  // 过滤和搜索笔记
  const searchResults = useMemo(() => {
    // 首先按分类筛选
    let filteredNotes = notes;
    if (selectedCategoryId !== 'all') {
      if (selectedCategoryId === 'uncategorized') {
        filteredNotes = notes.filter(note => !note.categoryId || note.categoryId === 'uncategorized');
      } else {
        filteredNotes = notes.filter(note => note.categoryId === selectedCategoryId);
      }
    }

    // 然后按搜索词筛选
    if (!searchQuery.trim()) {
      return filteredNotes.map(note => ({
        ...note,
        highlightedTitle: note.title,
        highlightedContent: truncateContent(note.content),
      }));
    }
    
    const query = searchQuery.toLowerCase();
    return filteredNotes.filter(note => 
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    ).map(note => ({
      ...note,
      // 预处理高亮文本
      highlightedTitle: note.title,
      highlightedContent: truncateContent(note.content),
    }));
  }, [notes, searchQuery, selectedCategoryId, truncateContent]);// 格式化时间 - 使用和主页面相同的逻辑
  const formatTime = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    
    // 检查是否为今天
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      // 今天显示时间 HH:MM
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else {
      // 其他日期显示 YYYY/MM/DD
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '/');
    }
  }, []);

  // 处理笔记点击
  const handleNotePress = useCallback((noteId: string) => {
    router.push({ 
      pathname: '/note-edit', 
      params: { 
        id: noteId
      } 
    });
  }, [router]);

  // 返回按钮处理
  const handleBackPress = useCallback(() => {
    router.back();
  }, [router]);
  // 清空搜索
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  }, []);

  // 处理分类选择
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
  }, []);
  // 获取当前选中分类的信息
  const selectedCategory = useMemo(() => {
    if (selectedCategoryId === 'all') {
      return { name: t('allNotes'), icon: 'file-text', color: '#2196F3' };
    }
    return categories.find(cat => cat.id === selectedCategoryId) || 
           { name: t('uncategorized'), icon: 'folder', color: '#9E9E9E' };
  }, [selectedCategoryId, categories, t]);

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={Colors[colorScheme].background}
        translucent={false}
      />
        {/* 头部搜索栏 */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <FontAwesome name="chevron-left" size={20} color={colors.text} />
        </TouchableOpacity>
        
        <View style={[styles.searchInputContainer, { 
          backgroundColor: colors.cardBackground,
          borderColor: colors.border
        }]}>
          <FontAwesome name="search" size={16} color={colors.secondaryText} />
          <TextInput
            ref={searchInputRef}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={String(t('searchNotes'))}
            placeholderTextColor={colors.secondaryText}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <FontAwesome name="times-circle" size={16} color={colors.secondaryText} />
            </TouchableOpacity>
          )}
        </View>
      </View>      {/* 分类选择器 */}
      <View style={[styles.categoryContainer, { backgroundColor: colors.background }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: 'all', name: t('allNotes'), icon: 'file-text', color: '#2196F3' }, ...categories.filter(cat => cat.id !== 'all')]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity              style={[
                styles.categoryItem,
                {
                  backgroundColor: selectedCategoryId === item.id ? colors.tint : colors.cardBackground,
                }
              ]}
              onPress={() => handleCategorySelect(item.id)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
                <FontAwesome 
                  name={item.icon as any} 
                  size={10} 
                  color="#fff" 
                />
              </View>              <Text style={[
                styles.categoryName, 
                { 
                  color: selectedCategoryId === item.id ? '#fff' : colors.text,
                  fontWeight: selectedCategoryId === item.id ? '600' : '400'
                }
              ]}>
                {item.id === 'all' || ['uncategorized', 'work', 'personal', 'study'].includes(item.name) 
                  ? t(item.id === 'all' ? 'allNotes' : item.name) 
                  : item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>      {/* 搜索结果 */}
      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {!searchQuery.trim() && selectedCategoryId === 'all' ? (
          <View style={styles.emptyContainer}>
            <FontAwesome name="search" size={48} color={colors.tertiaryText} />
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              {t('enterSearchTerm')}
            </Text>
          </View>
        ) : searchResults.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome name="file-o" size={48} color={colors.tertiaryText} />
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              {searchQuery.trim() ? t('noSearchResults') : t('noCategoryNotes')}
            </Text>
            <Text style={[styles.emptySubText, { color: colors.tertiaryText }]}>
              {searchQuery.trim() ? t('tryDifferentKeywords') : t('selectDifferentCategory')}
            </Text>
          </View>
        ) : (
          <>            <Text style={[styles.resultsCount, { color: colors.secondaryText }]}>
              {searchQuery.trim() 
                ? t('foundResults', { count: searchResults.length })
                : `${['allNotes', 'uncategorized', 'work', 'personal', 'study'].includes(selectedCategory.name) ? t(selectedCategory.name) : selectedCategory.name}: ${searchResults.length} 条笔记`
              }
            </Text>
            {searchResults.map((note) => (
              <Pressable
                key={note.id}
                style={[
                  styles.noteCard,
                  { 
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border
                  }
                ]}
                onPress={() => handleNotePress(note.id)}
              >
                <View style={styles.noteHeader}>
                  {renderHighlightedText(
                    note.title || t('untitled'),
                    searchQuery,
                    [styles.noteTitle, { color: colors.text }]
                  )}
                  {note.pinned && (
                    <FontAwesome 
                      name="thumb-tack" 
                      size={12} 
                      color={colors.tint} 
                      style={styles.pinIcon}
                    />
                  )}
                </View>
                
                {renderHighlightedText(
                  note.highlightedContent,
                  searchQuery,
                  [styles.noteContent, { color: colors.secondaryText }]
                )}
                
                <Text style={[styles.noteTime, { color: colors.tertiaryText }]}>
                  {formatTime(note.updatedAt)}
                </Text>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 0,
    gap: 8,
  },searchInput: {
    flex: 1,
    fontSize: 16,
    minHeight: 32,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  categoryContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  categoryList: {
    paddingHorizontal: 16,
  },  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 0,
  },categoryIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  categoryName: {
    fontSize: 12,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultsCount: {
    fontSize: 14,
    marginVertical: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  noteCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  pinIcon: {
    marginLeft: 8,
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  noteTime: {
    fontSize: 12,
    fontWeight: '500',
  },
});
