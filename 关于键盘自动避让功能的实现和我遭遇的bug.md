# 键盘自动避让功能的实现和我遭遇的bug

历经三日反复处理同一个bug，我今天终于决定彻底放弃。本文档权且记录一下我尝试过的解决方案和bug的具体情况。

## 键盘避让功能是什么

键盘自动避让功能是指当用户点击输入框时，系统会自动将输入框移动到屏幕的最上方，以避免用户输入时遮挡输入框。

实际上，我希望实现的键盘避让功能是在长文本多行输入场景，当用户在一个输入框内输入多行文字时，屏幕可以自动滚动以实现键盘自动避让输入内容，保持输入内容可见。

## 如何实现键盘自动避让功能

经过查找官方文档、网络上的教程和博客和询问AI，得到以下三种方法

### 一、使用原生的`ScrollView`组件

1. 设置`AndroidManifest.xml`，确保 MainActivity 中设置了如下属性：

```xml
<activity
  android:name=".MainActivity"
  android:windowSoftInputMode="adjustResize">
</activity>
```

这一步是为了告诉 Android 在键盘弹出时自动调整视图高度，触发滚动

2. 在布局文件中使用`ScrollView`包裹输入框：

首先
```tsx
import { ScrollView } from'react-native';
```

然后

```tsx

<ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
      {/* 输入框 */}
      <TextInput
        style={{ flex: 1, fontSize: 16, minHeight: 200 }}
        placeholder="请输入内容"
        multiline={true}
        scrollEnabled={false} // ✅ 让父 ScrollView 控制滚动
        />
</ScrollView>
```

- 还可以使用监听键盘事件，手动调整 ScrollView 的高度。这里不做更多介绍。

- 在有多个输入框，或者其他需要更精细控制的场景，`ScrollView` **无法**满足需求。


### 二、使用`KeyboardAvoidingView` + `ScrollView` 

- 实例代码

```tsx
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';

export default function NoteEditor() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
        <TextInput
          multiline
          style={{ flex: 1, fontSize: 16, minHeight: 200 }}
          placeholder="请输入内容"
          scrollEnabled={false} // ✅ 让父 ScrollView 控制滚动
        />
      </ScrollView>

      <View style={{ height: 60, backgroundColor: '#eee' }}>
        {/* 底部工具栏 */}
      </View>
    </KeyboardAvoidingView>
  );
}
```

- ScrollView 本身的滚动行为对于动态变化（如软键盘弹出）不够灵敏，尤其是在包含 TextInput multiline 时，不会自动滚动到光标位置。

- 加上`KeyboardAvoidingView`组件，可以自动处理软键盘弹出和收回的情况，并将输入框移动到屏幕最上方。但是还是**无法**处理multiline的情况。

### 三、使用[react-native-keyboard-aware-scroll-view ](https://github.com/APSL/react-native-keyboard-aware-scroll-view)的`KeyboardAwareScrollView`组件

1. 安装依赖

```bash
npm install react-native-keyboard-aware-scroll-view
```

2. 导入组件

```tsx
import { KeyboardAwareScrollView } from'react-native-keyboard-aware-scroll-view';
```

3. 使用组件

```tsx
<KeyboardAwareScrollView
  enableOnAndroid
  extraScrollHeight={100} // 自动多滚动一些距离以避免被遮挡， 根据实际情况调整
  keyboardShouldPersistTaps="handled"
  contentContainerStyle={{
    flexGrow: 1,
    padding: getContentPadding(pageSettings.marginValue),
  }}
>
  {/* 输入框 */}
  <TextInput
    style={{ flex: 1, fontSize: 16, minHeight: 200 }}
    placeholder="请输入内容"
    multiline={true}
    scrollEnabled={false} // ✅ 让外部组件控制滚动
  />
</KeyboardAwareScrollView>
```

- KeyboardAwareScrollView 相当于在可滚动视图的基础上实现了键盘避让功能，是 KeyboardAvoidingView 的超集。

- 可控制性能最好的组件，可以处理输入光标在长文本的最下方的情况，但是`extraScrollHeight`过大时会遮挡上方的内容。

## 遭遇的bug   

所有声称可以自动调整滚动的组件都无法完美处理`multiline`的情况。

最后采取了方案三作为妥协。

## 参考资料

1. https://github.com/APSL/react-native-keyboard-aware-scroll-view
2. https://blog.logrocket.com/keyboardawarescrollview-keyboardavoidingview-react-native/
3. https://reactnative.dev/docs/keyboardavoidingview
4. https://stackoverflow.com/questions/45466026/keyboard-aware-scroll-view-android-issue
5. https://github.com/APSL/react-native-keyboard-aware-scroll-view/issues/227

# 5/25 更新

目前已经解决了键盘避让功能无法正确实现的问题。

解决方案：采用@10play/tentap-editor的富文本编辑框组件替代了textinput组件。在这个组件下，react-native-keyboard-aware-scroll-view组件可以完美实现键盘避让功能。

具体实现方法：参见[RichTextContent.tsx](./app/components/RichTextContent.tsx)