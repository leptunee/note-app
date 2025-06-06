// 涂鸦画板组件
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { View, PanResponder, Dimensions, StyleSheet, TouchableOpacity, Text, Modal, useColorScheme } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';

interface Point {
  x: number;
  y: number;
}

interface DrawingPath {
  path: string;
  color: string;
  width: number;
}

interface DrawingCanvasProps {
  width: number;
  height: number;
  onSave: (imageData: string) => void; // 修改为返回图片数据而不是SVG
  onCancel: () => void;
  visible: boolean;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width,
  height,
  onSave,
  onCancel,
  visible
}) => {
  console.log('DrawingCanvas render, visible:', visible, 'width:', width, 'height:', height);
  const colorScheme = useColorScheme();
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [currentColor, setCurrentColor] = useState('#000000');  const [currentWidth, setCurrentWidth] = useState(3);
  const pathRef = useRef<string>('');
  const svgRef = useRef<View>(null); // 添加SVG容器的引用

  // 添加调试信息
  console.log('DrawingCanvas state - paths count:', paths.length, 'currentPath:', currentPath.length > 0 ? 'drawing' : 'empty');
  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
  const widths = [1, 3, 5, 8];

  // 监听visible状态变化
  useEffect(() => {
    console.log('DrawingCanvas visible changed to:', visible);
    if (visible) {
      // 当画布打开时，重置状态
      console.log('Resetting drawing state on open');
      setPaths([]);
      setCurrentPath('');
      pathRef.current = '';
    }
  }, [visible]);const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => {
      console.log('onStartShouldSetPanResponder');
      return true;
    },
    onMoveShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponderCapture: () => false,
    onShouldBlockNativeResponder: () => false,

    onPanResponderGrant: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      console.log('onPanResponderGrant at:', locationX, locationY);
      const newPath = `M${locationX.toFixed(2)},${locationY.toFixed(2)}`;
      pathRef.current = newPath;
      setCurrentPath(newPath);
      console.log('Started new path:', newPath);
    },

    onPanResponderMove: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      const newPath = pathRef.current + ` L${locationX.toFixed(2)},${locationY.toFixed(2)}`;
      pathRef.current = newPath;
      setCurrentPath(newPath);
    },

    onPanResponderRelease: () => {
      console.log('onPanResponderRelease, pathRef:', pathRef.current);
      if (pathRef.current) {
        const newPathObj = {
          path: pathRef.current,
          color: currentColor,
          width: currentWidth
        };
        console.log('Adding path to paths:', newPathObj);
        setPaths(prev => {
          const updated = [...prev, newPathObj];
          console.log('Updated paths array length:', updated.length);
          return updated;
        });
        setCurrentPath('');
        pathRef.current = '';
      }
    },

    onPanResponderTerminate: () => {
      console.log('onPanResponderTerminate, pathRef:', pathRef.current);
      // 处理意外终止的情况
      if (pathRef.current) {
        const newPathObj = {
          path: pathRef.current,
          color: currentColor,
          width: currentWidth
        };
        console.log('Adding terminated path to paths:', newPathObj);
        setPaths(prev => {
          const updated = [...prev, newPathObj];
          console.log('Updated paths array length (terminate):', updated.length);
          return updated;
        });
        setCurrentPath('');
        pathRef.current = '';
      }
    },
  }), [currentColor, currentWidth]);

  const handleClear = useCallback(() => {
    setPaths([]);
    setCurrentPath('');
    pathRef.current = '';
  }, []);

  const handleUndo = useCallback(() => {
    setPaths(prev => prev.slice(0, -1));
  }, []);  const handleSave = useCallback(async () => {
    console.log('Saving drawing with', paths.length, 'paths');
    
    if (paths.length === 0) {
      console.log('No paths to save');
      onCancel();
      return;
    }
    
    try {
      if (svgRef.current) {
        console.log('Capturing SVG as image...');
        // 使用view-shot将SVG容器截图为base64图片
        const imageUri = await captureRef(svgRef.current, {
          format: 'png',
          quality: 1.0,
          result: 'data-uri', // 直接返回data:image/png;base64,xxx格式
        });
        
        console.log('Generated image data length:', imageUri.length);
        onSave(imageUri);
      } else {
        console.error('SVG ref not available');
        onCancel();
      }
    } catch (error) {
      console.error('Failed to capture drawing:', error);
      onCancel();
    }
  }, [paths, onSave, onCancel]);

  const containerStyle = useMemo(() => [
    styles.modalContainer,
    { backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff' }
  ], [colorScheme]);

  const toolbarStyle = useMemo(() => [
    styles.toolbar,
    { 
      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f0f0f0',
      borderBottomColor: colorScheme === 'dark' ? '#404040' : '#e0e0e0'
    }
  ], [colorScheme]);

  const canvasStyle = useMemo(() => [
    styles.canvas,
    { 
      backgroundColor: '#ffffff',
      width: width,
      height: height
    }
  ], [width, height]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      presentationStyle="fullScreen"
      onRequestClose={onCancel}
    >
      <View style={containerStyle}>
        {/* 顶部工具栏 */}
        <View style={toolbarStyle}>
          <View style={styles.toolSection}>
            <TouchableOpacity onPress={onCancel} style={styles.toolButton}>
              <FontAwesome name="times" size={20} color={colorScheme === 'dark' ? '#fff' : '#333'} />
              <Text style={[styles.toolText, { color: colorScheme === 'dark' ? '#fff' : '#333' }]}>取消</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleSave} style={styles.toolButton}>
              <FontAwesome name="check" size={20} color="#007AFF" />
              <Text style={[styles.toolText, { color: '#007AFF' }]}>保存</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.toolSection}>
            <TouchableOpacity onPress={handleUndo} style={styles.toolButton}>
              <FontAwesome name="undo" size={18} color={colorScheme === 'dark' ? '#fff' : '#333'} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleClear} style={styles.toolButton}>
              <FontAwesome name="trash" size={18} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 颜色选择器 */}
        <View style={[styles.colorPicker, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f8f8f8' }]}>
          <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#333' }]}>颜色:</Text>
          <View style={styles.colorRow}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setCurrentColor(color)}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  currentColor === color && styles.selectedColor
                ]}
              />
            ))}
          </View>
        </View>

        {/* 笔刷大小选择器 */}
        <View style={[styles.widthPicker, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f8f8f8' }]}>
          <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#333' }]}>笔刷:</Text>
          <View style={styles.widthRow}>
            {widths.map((width) => (
              <TouchableOpacity
                key={width}
                onPress={() => setCurrentWidth(width)}
                style={[
                  styles.widthButton,
                  currentWidth === width && styles.selectedWidth
                ]}
              >
                <View style={[
                  styles.widthDot,
                  { 
                    width: width * 2 + 8, 
                    height: width * 2 + 8, 
                    backgroundColor: currentColor 
                  }
                ]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>        {/* 画布区域 */}
        <View style={styles.canvasContainer}>
          <View 
            ref={svgRef}
            style={canvasStyle} 
            {...panResponder.panHandlers}
          >
            <Svg
              width={width}
              height={height}
              style={StyleSheet.absoluteFillObject}
            >
              {/* 渲染已完成的路径 */}
              {paths.map((pathData, index) => (
                <Path
                  key={index}
                  d={pathData.path}
                  stroke={pathData.color}
                  strokeWidth={pathData.width}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              
              {/* 渲染当前正在绘制的路径 */}
              {currentPath && (
                <Path
                  d={currentPath}
                  stroke={currentColor}
                  strokeWidth={currentWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </Svg>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    paddingTop: 50, // 为状态栏留出空间
  },
  toolSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  toolText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '500',
  },
  colorPicker: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  widthPicker: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  widthRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  widthButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedWidth: {
    borderColor: '#007AFF',
  },
  widthDot: {
    borderRadius: 20,
  },
  canvasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  canvas: {
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});