import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Linking, Image, StatusBar, Alert } from 'react-native';
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
  };  const handleSponsorPress = () => {
    Alert.alert(
      t('sponsorAuthor'),
      t('supportDevelopment'),
      [
        {
          text: '赞赏码',
          onPress: () => {
            Alert.alert(
              '赞赏支持',
              '感谢您的支持！可通过微信或支付宝扫描赞赏码支持开发者。\n\n赞赏功能即将开放，敬请期待！'
            );
          }
        },
        {
          text: '取消',
          style: 'cancel'
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={Colors[colorScheme].background}
        translucent={false}
      />
      <View style={styles.header}>
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
      </View>
      <View style={styles.content}>
        <View style={styles.appIconContainer}>
          <Image 
            source={require('@/assets/images/icon.png')}
            style={styles.appIcon}
            resizeMode="cover"
          />
        </View>
        <Text style={[styles.appName, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
          {t('appName')}
        </Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <FontAwesome 
              name="tag" 
              size={20} 
              color={Colors[colorScheme].tint} 
              style={styles.infoIcon} 
            />            
            <Text style={[styles.infoLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
              {t('version')}：
            </Text>
            <Text style={[styles.infoValue, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              1.0.0
            </Text>
          </View>          <TouchableOpacity style={styles.infoItem} onPress={handleEmailPress}>
            <FontAwesome 
              name="envelope" 
              size={20} 
              color={Colors[colorScheme].tint} 
              style={styles.infoIcon} 
            />            
            <Text style={[styles.infoLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
              {t('authorEmail')}：
            </Text>
            <Text style={[styles.infoValue, styles.emailText, { color: Colors[colorScheme].tint }]}>
              leptunee@qq.com
            </Text>          
          </TouchableOpacity>

          <TouchableOpacity style={[styles.infoItem, styles.sponsorButton]} onPress={handleSponsorPress}>
            <FontAwesome 
              name="heart" 
              size={20} 
              color="#FF6B6B" 
              style={styles.infoIcon} 
            />            
            <Text style={[styles.sponsorText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              {t('sponsorAuthor')}
            </Text>
            <FontAwesome 
              name="chevron-right" 
              size={16} 
              color={colorScheme === 'dark' ? '#ccc' : '#666'} 
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.description, { color: colorScheme === 'dark' ? '#888' : '#999' }]}>
          {t('description')}
        </Text>
      </View>
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
    paddingBottom: 20,
  },  
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  appIconContainer: {
    marginBottom: 24,
  },  
  appIcon: {
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
  },  emailText: {
    textDecorationLine: 'underline',
  },
  sponsorButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  sponsorText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 20,
  },
});
