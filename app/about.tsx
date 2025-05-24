import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Linking, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';

export default function AboutScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const handleEmailPress = () => {
    Linking.openURL('mailto:leptunee@qq.com');
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome 
            name="chevron-left" 
            size={20} 
            color={Colors[colorScheme].tint} 
          />
        </TouchableOpacity>
      </View><View style={styles.content}>
        <View style={styles.appIconContainer}>
          <Image 
            source={require('@/assets/images/icon.png')}
            style={styles.appIcon}
            resizeMode="cover"
          />
        </View><Text style={[styles.appName, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
          {t('appName')}
        </Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <FontAwesome 
              name="tag" 
              size={20} 
              color={Colors[colorScheme].tint} 
              style={styles.infoIcon} 
            />            <Text style={[styles.infoLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
              {t('version')}：
            </Text>
            <Text style={[styles.infoValue, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              1.0.0
            </Text>
          </View>

          <TouchableOpacity style={styles.infoItem} onPress={handleEmailPress}>
            <FontAwesome 
              name="envelope" 
              size={20} 
              color={Colors[colorScheme].tint} 
              style={styles.infoIcon} 
            />            <Text style={[styles.infoLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
              {t('authorEmail')}：
            </Text>
            <Text style={[styles.infoValue, styles.emailText, { color: Colors[colorScheme].tint }]}>
              leptunee@qq.com
            </Text>          </TouchableOpacity>
        </View>        <Text style={[styles.description, { color: colorScheme === 'dark' ? '#888' : '#999' }]}>
          {t('description')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  appIconContainer: {
    marginBottom: 24,
  },  appIcon: {
    width: 100,
    height: 100,
    borderRadius: 20,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0.2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 0,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  infoContainer: {
    width: '100%',
    marginBottom: 40,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  infoIcon: {
    marginRight: 12,
    width: 24,
  },
  infoLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  emailText: {
    textDecorationLine: 'underline',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 20,
  },
});
