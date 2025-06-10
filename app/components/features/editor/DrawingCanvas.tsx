// 涂鸦画板组件
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { View, PanResponder, Dimensions, StyleSheet, TouchableOpacity, Text, Modal, useColorScheme } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';
import { useTranslation } from 'react-i18next';

interface Point {
  x: number;
  y: number;
}

interface DrawingPath {
  path: string;
  color: string;
  width: number;
  isEraser?: boolean; // 标记是否为橡皮擦路径
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
  onCancel,  visible
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [currentColor, setCurrentColor] = useState('#000000');  const [currentWidth, setCurrentWidth] = useState(3);  const [isEraserMode, setIsEraserMode] = useState(false); // 橡皮擦模式状态
  const [eraserType, setEraserType] = useState<'pixel' | 'stroke'>('pixel'); // 橡皮擦类型
  const [undoStack, setUndoStack] = useState<DrawingPath[][]>([]); // 撤销栈
  const [redoStack, setRedoStack] = useState<DrawingPath[][]>([]); // 重做栈
  const pathRef = useRef<string>('');
  const svgRef = useRef<View>(null); // 添加SVG容器的引用
  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
  const widths = [1, 3, 5, 8];
  
  // 检查点是否在路径附近的辅助函数
  const findPathAtPoint = useCallback((point: Point, pathList: DrawingPath[]): number => {
    for (let i = pathList.length - 1; i >= 0; i--) {
      const path = pathList[i];
      if (isPointNearPath(point, path)) {
        return i;
      }
    }
    return -1;
  }, []);

  // 简化的路径碰撞检测
  const isPointNearPath = useCallback((point: Point, pathData: DrawingPath): boolean => {
    const pathCommands = pathData.path.split(/[ML]/);
    const tolerance = Math.max(pathData.width, 10); // 至少10像素的容忍度

    for (let i = 1; i < pathCommands.length; i++) {
      const coords = pathCommands[i].trim().split(',');
      if (coords.length === 2) {
        const pathPoint = {
          x: parseFloat(coords[0]),
          y: parseFloat(coords[1])
        };
        const distance = Math.sqrt(
          Math.pow(point.x - pathPoint.x, 2) + Math.pow(point.y - pathPoint.y, 2)
        );
        if (distance <= tolerance) {
          return true;
        }
      }
    }
    return false;
  }, []);  // 监听visible状态变化
  useEffect(() => {
    if (visible) {
      // 当画布打开时，重置状态
      setPaths([]);
      setCurrentPath('');
      setIsEraserMode(false);
      setEraserType('pixel');
      setUndoStack([]);
      setRedoStack([]);
      pathRef.current = '';
    }
  }, [visible]);const panResponder = useMemo(() => PanResponder.create({    onStartShouldSetPanResponder: () => {
      return true;
    },
    onMoveShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponderCapture: () => false,
    onShouldBlockNativeResponder: () => false,    onPanResponderGrant: (event) => {
      const { locationX, locationY } = event.nativeEvent;
        if (isEraserMode && eraserType === 'stroke') {
        // 笔画橡皮擦：检查是否点击到了某个路径，如果是则删除该路径
        const point = { x: locationX, y: locationY };
        const pathToRemove = findPathAtPoint(point, paths);
        if (pathToRemove !== -1) {
          setPaths(prev => {
            const updated = prev.filter((_, index) => index !== pathToRemove);
            // 保存当前状态到撤销栈
            setUndoStack(undoStack => [...undoStack, prev]);
            // 清空重做栈
            setRedoStack([]);
            return updated;
          });
        }
        return;
      }
      
      const newPath = `M${locationX.toFixed(2)},${locationY.toFixed(2)}`;
      pathRef.current = newPath;
      setCurrentPath(newPath);
    },    onPanResponderMove: (event) => {
      const { locationX, locationY } = event.nativeEvent;
        if (isEraserMode && eraserType === 'stroke') {
        // 笔画橡皮擦：在移动时继续检查和删除路径
        const point = { x: locationX, y: locationY };
        const pathToRemove = findPathAtPoint(point, paths);
        if (pathToRemove !== -1) {
          setPaths(prev => {
            const updated = prev.filter((_, index) => index !== pathToRemove);
            // 保存当前状态到撤销栈
            setUndoStack(undoStack => [...undoStack, prev]);
            // 清空重做栈
            setRedoStack([]);
            return updated;
          });
        }
        return;
      }
      
      const newPath = pathRef.current + ` L${locationX.toFixed(2)},${locationY.toFixed(2)}`;
      pathRef.current = newPath;
      setCurrentPath(newPath);
    },    onPanResponderRelease: () => {
      if (isEraserMode && eraserType === 'stroke') {
        // 笔画橡皮擦不需要添加新路径
        return;
      }
      
      if (pathRef.current) {
        const newPathObj = {
          path: pathRef.current,
          color: (isEraserMode && eraserType === 'pixel') ? '#ffffff' : currentColor,
          width: currentWidth,
          isEraser: isEraserMode && eraserType === 'pixel'
        };
        setPaths(prev => {
          const updated = [...prev, newPathObj];
          // 保存当前状态到撤销栈
          setUndoStack(undoStack => [...undoStack, prev]);
          // 清空重做栈
          setRedoStack([]);
          return updated;
        });
        setCurrentPath('');
        pathRef.current = '';
      }
    },onPanResponderTerminate: () => {
      if (isEraserMode && eraserType === 'stroke') {
        // 笔画橡皮擦不需要添加新路径
        return;
      }
      
      // 处理意外终止的情况
      if (pathRef.current) {
        const newPathObj = {
          path: pathRef.current,
          color: (isEraserMode && eraserType === 'pixel') ? '#ffffff' : currentColor,
          width: currentWidth,
          isEraser: isEraserMode && eraserType === 'pixel'
        };
        setPaths(prev => {
          const updated = [...prev, newPathObj];
          return updated;
        });
        setCurrentPath('');
        pathRef.current = '';
      }
    },
  }), [currentColor, currentWidth, isEraserMode, eraserType, findPathAtPoint, paths]);
  const handleClear = useCallback(() => {
    if (paths.length > 0) {
      // 保存当前状态到撤销栈
      setUndoStack(prev => [...prev, paths]);
      // 清空重做栈
      setRedoStack([]);
    }
    setPaths([]);
    setCurrentPath('');
    pathRef.current = '';
  }, [paths]);

  const handleUndo = useCallback(() => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      // 保存当前状态到重做栈
      setRedoStack(prev => [...prev, paths]);
      // 恢复到之前的状态
      setPaths(previousState);
      // 从撤销栈中移除
      setUndoStack(prev => prev.slice(0, -1));
    }
  }, [undoStack, paths]);

  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      // 保存当前状态到撤销栈
      setUndoStack(prev => [...prev, paths]);
      // 恢复到下一个状态
      setPaths(nextState);
      // 从重做栈中移除
      setRedoStack(prev => prev.slice(0, -1));
    }
  }, [redoStack, paths]);  const handleSave = useCallback(async () => {
    if (paths.length === 0) {
      onCancel();
      return;
    }
    
    try {
      if (svgRef.current) {
        // 使用view-shot将SVG容器截图为base64图片
        const imageUri = await captureRef(svgRef.current, {
          format: 'png',
          quality: 1.0,
          result: 'data-uri', // 直接返回data:image/png;base64,xxx格式
        });
        
        onSave(imageUri);
      } else {
        onCancel();
      }
    } catch (error) {
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
  ], [colorScheme]);  const canvasStyle = useMemo(() => [
    styles.canvas,
    { 
      backgroundColor: '#ffffff',
      width: width,
      height: height,
      overflow: 'visible' as const, // 确保内容不被裁剪
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
      <View style={containerStyle}>        {/* 顶部工具栏 */}
        <View style={toolbarStyle}>
          <View style={styles.toolSection}>
            <TouchableOpacity onPress={onCancel} style={styles.toolButton}>
              <FontAwesome name="times" size={20} color={colorScheme === 'dark' ? '#fff' : '#333'} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleUndo} 
              style={[styles.toolButton, undoStack.length === 0 && styles.disabledButton]}
              disabled={undoStack.length === 0}
            >
              <FontAwesome 
                name="undo" 
                size={18} 
                color={undoStack.length === 0 ? '#999' : (colorScheme === 'dark' ? '#fff' : '#333')} 
              />
            </TouchableOpacity>
              <TouchableOpacity 
              onPress={handleRedo} 
              style={[styles.toolButton, redoStack.length === 0 && styles.disabledButton]}
              disabled={redoStack.length === 0}
            >
              <FontAwesome 
                name="rotate-right" 
                size={18} 
                color={redoStack.length === 0 ? '#999' : (colorScheme === 'dark' ? '#fff' : '#333')} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleClear} style={styles.toolButton}>
              <FontAwesome name="trash" size={18} color="#FF3B30" />
            </TouchableOpacity>
          </View>

          <View style={styles.toolSection}>
            <TouchableOpacity onPress={handleSave} style={styles.toolButton}>
              <FontAwesome name="check" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>{/* 颜色选择器 */}
        <View style={[styles.colorPicker, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f8f8f8' }]}>
          <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#333' }]}>{t('color')}:</Text>
          <View style={styles.colorRow}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => {
                  setCurrentColor(color);
                  setIsEraserMode(false); // 选择颜色时退出橡皮擦模式
                }}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  currentColor === color && !isEraserMode && styles.selectedColor
                ]}
              />
            ))}
          </View>
        </View>        {/* 笔刷大小选择器 */}
        <View style={[styles.widthPicker, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f8f8f8' }]}>          <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#333' }]}>
            {t('brush')}: {isEraserMode ? (eraserType === 'pixel' ? t('pixelEraser') : t('strokeEraser')) : t('paint')}
          </Text>
          <View style={styles.widthRow}>            {widths.map((width) => (
              <TouchableOpacity
                key={width}
                onPress={() => {
                  setCurrentWidth(width);
                  setIsEraserMode(false); // 选择笔刷时退出橡皮擦模式
                }}
                style={[
                  styles.widthButton,
                  currentWidth === width && !isEraserMode && styles.selectedWidth
                ]}
              >
                <View style={[
                  styles.widthDot,
                  { 
                    width: width * 2 + 8, 
                    height: width * 2 + 8, 
                    backgroundColor: isEraserMode ? '#999' : currentColor 
                  }
                ]} />
              </TouchableOpacity>
            ))}
            
            {/* 分割线 */}
            <View style={styles.toolDivider} />
            
            {/* 像素橡皮擦工具 */}
            <TouchableOpacity
              onPress={() => {
                setIsEraserMode(true);
                setEraserType('pixel');
              }}
              style={[
                styles.eraserButton,
                isEraserMode && eraserType === 'pixel' && styles.selectedEraser
              ]}
            >
              <FontAwesome 
                name="square-o" 
                size={18} 
                color={isEraserMode && eraserType === 'pixel' ? '#007AFF' : (colorScheme === 'dark' ? '#fff' : '#333')} 
              />
            </TouchableOpacity>
            
            {/* 笔画橡皮擦 */}
            <TouchableOpacity
              onPress={() => {
                setIsEraserMode(true);
                setEraserType('stroke');
              }}
              style={[
                styles.eraserButton,
                isEraserMode && eraserType === 'stroke' && styles.selectedEraser
              ]}
            >
              <FontAwesome 
                name="remove" 
                size={18} 
                color={isEraserMode && eraserType === 'stroke' ? '#007AFF' : (colorScheme === 'dark' ? '#fff' : '#333')} 
              />
            </TouchableOpacity>
          </View>
        </View>{/* 画布区域 */}
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
            >              {/* 渲染已完成的路径 */}
              {paths.map((pathData, index) => (
                <Path
                  key={index}
                  d={pathData.path}
                  stroke={pathData.isEraser ? '#ffffff' : pathData.color}
                  strokeWidth={pathData.width}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}{/* 渲染当前正在绘制的路径 */}
              {currentPath && !(isEraserMode && eraserType === 'stroke') && (
                <Path
                  d={currentPath}
                  stroke={(isEraserMode && eraserType === 'pixel') ? '#ffffff' : currentColor}
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
  },  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  disabledButton: {
    opacity: 0.5,
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
  },  selectedWidth: {
    borderColor: '#007AFF',
  },  widthDot: {
    borderRadius: 20,
  },
  toolDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#ccc',
    marginHorizontal: 8,
  },  eraserButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedEraser: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
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