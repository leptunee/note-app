import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Text, StyleSheet, View, Animated, Easing, Dimensions } from 'react-native';

interface ToastProps {
  backgroundColor?: string;
  textColor?: string;
  duration?: number;
  position?: 'top' | 'bottom' | 'center';
}

export interface ToastRef {
  show: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const Toast = forwardRef<ToastRef, ToastProps>(
  ({ 
    backgroundColor = '#333', 
    textColor = '#fff', 
    duration = 1500, // 缩短为 1.5 秒
    position = 'bottom'
  }, ref) => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
    const opacity = useState(new Animated.Value(0))[0];

    useImperativeHandle(ref, () => ({
      show(msg, type = 'info') {
        setMessage(msg);
        setToastType(type);
        setVisible(true);
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }).start(() => {
          setTimeout(() => {
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              easing: Easing.ease,
              useNativeDriver: true,
            }).start(() => {
              setVisible(false);
              setMessage('');
            });
          }, duration);
        });
      },
    }));

    const getBackgroundColor = () => {
      if (toastType === 'success') return '#4CAF50'; // Green
      if (toastType === 'error') return '#F44336';   // Red
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
      >
        <Animated.View
          style={[
            styles.toast,
            { backgroundColor: getBackgroundColor(), opacity },
          ]}
        >
          <Text style={[styles.message, { color: textColor }]}>{message}</Text>
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
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Toast;
