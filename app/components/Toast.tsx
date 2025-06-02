import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Text, StyleSheet, View, Animated, Easing, Dimensions, ActivityIndicator } from 'react-native';

interface ToastProps {
  backgroundColor?: string;
  textColor?: string;
  duration?: number;
  position?: 'top' | 'bottom' | 'center';
}

export interface ToastRef {
  show: (message: string, type?: 'success' | 'error' | 'info' | 'loading') => void;
  hide: () => void; // 新增：手动隐藏Toast的方法
}

const Toast = forwardRef<ToastRef, ToastProps>(
  ({ 
    backgroundColor = '#333', 
    textColor = '#fff', 
    duration = 1500, // 缩短为 1.5 秒
    position = 'bottom'
  }, ref) => {    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'loading'>('info');
    const opacity = useState(new Animated.Value(0))[0];
    const [hideTimeout, setHideTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);    useImperativeHandle(ref, () => ({
      show(msg, type = 'info') {
        // 清除之前的隐藏定时器
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          setHideTimeout(null);
        }
        
        setMessage(msg);
        setToastType(type);
        setVisible(true);
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }).start(() => {
          // loading类型的toast不会自动隐藏
          if (type !== 'loading') {
            const timeout = setTimeout(() => {
              Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                easing: Easing.ease,
                useNativeDriver: true,
              }).start(() => {
                setVisible(false);
                setMessage('');
                setHideTimeout(null);
              });
            }, duration);
            setHideTimeout(timeout);
          }
        });
      },
      hide() {
        // 清除隐藏定时器
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          setHideTimeout(null);
        }
        
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }).start(() => {
          setVisible(false);
          setMessage('');
        });
      },
    }));    const getBackgroundColor = () => {
      if (toastType === 'success') return '#4CAF50'; // Green
      if (toastType === 'error') return '#F44336';   // Red
      if (toastType === 'loading') return '#2196F3';  // Blue
      if (toastType === 'info') return backgroundColor; // Default or custom
      return backgroundColor;
    };
      const positionStyle = () => {
      const { height } = Dimensions.get('window');
      if (position === 'top') return { top: 50 };
      if (position === 'bottom') return { bottom: 50 };
      if (position === 'center') return { top: height / 2 - 50 }; // Adjust 50 based on expected toast height
      return { bottom: 50 }; // Default
    };

    if (!visible) {
      return null;
    }

    return (
      <View 
        style={[styles.container, positionStyle()]} 
        pointerEvents="none" // 允许触摸事件穿透到下层组件
      >        <Animated.View
          style={[
            styles.toast,
            { backgroundColor: getBackgroundColor(), opacity },
          ]}
        >
          <View style={styles.toastContent}>
            {toastType === 'loading' && (
              <ActivityIndicator 
                size="small" 
                color={textColor} 
                style={styles.loadingIndicator}
              />
            )}
            <Text style={[styles.message, { color: textColor }]}>{message}</Text>
          </View>
        </Animated.View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99999, // 确保 toast 在最顶层
    elevation: 99999, // Android 下的层级
    pointerEvents: 'none', // 默认不拦截触摸事件
  },
  toast: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    marginHorizontal: 20,
    pointerEvents: 'none', // 不拦截触摸事件
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIndicator: {
    marginRight: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Toast;
