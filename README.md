# TakeNotes - Smart Note-Taking App

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Android-lightgrey.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.79.2-61dafb.svg)
![Expo](https://img.shields.io/badge/Expo-53.0.7-000020.svg)

🌍 **Language**: [中文](README-zh.md) | **English**

A modern note-taking application built with React Native and Expo. Designed to help you record thoughts, backup ideas, and let TakeNotes become an extension of your thinking.

## 🚀 Core Features

### 📝 Rich Text Editing
- Text formatting support (bold, italic, underline, etc.)
- Insert images and drawings
- Custom page settings (background, opacity, margins, etc.)
- Multiple theme modes (Default, Light Green, Sepia, Blue)
- Real-time character count

### 📂 Category Management
- Preset categories: Work, Personal, Study, Uncategorized
- Custom category creation and editing
- Category icon and color customization
- Sidebar quick category switching
- Batch move notes to specific categories

### 🔍 Search
- Full-text search through note content
- Filter search results by category
- Search keyword highlighting
- Real-time search result statistics

### 📤 Multi-format Export
- **Text Files** (.txt) - Plain text export
- **Word Documents** (.html) - Rich text format preserved
- **Markdown** (.md) - Markup syntax support
- **Images** (.png) - Visual export
- Batch export multiple notes

### 🌍 Internationalization
- Chinese and English language switching
- Automatic system language detection
- Complete interface localization

### 📌 Practical Features
- Pin/unpin notes
- Multi-select mode for batch operations
- Long press to enter selection mode

## ⚡ Technical Features

### Performance Optimization
- React.memo component caching
- useCallback/useMemo optimization
- FlatList virtualized lists
- Batch operations to reduce rendering
- Chunked data storage management

### User Experience
- Smooth animation effects
- Keyboard-aware scrolling
- Smart toolbar positioning
- Responsive interface design

## 📱 Screenshots

![Main Interface](/Screenshot_20250611_183019.jpg)
![Note Editing Page (Custom Background)](/Screenshot_20250611_183330.jpg)

## 🛠️ Tech Stack

- **Framework**: React Native 0.79.2
- **Development Platform**: Expo 53.0.7
- **Routing**: Expo Router 5.0.5
- **Rich Text Editor**: @10play/tentap-editor 0.7.0
- **Internationalization**: react-i18next 15.5.1
- **State Management**: React Hooks
- **Data Storage**: AsyncStorage
- **Image Processing**: react-native-view-shot
- **Keyboard Handling**: react-native-keyboard-aware-scroll-view

## 📋 System Requirements

### Android
- Android 6.0 (API Level 23) or higher
- ARM64 architecture support

## 🔧 Development Environment Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- Android Studio (for Android development)

### Installation Steps

1. **Clone the project**
```bash
git clone <repository-url>
cd noteApp
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm start
```

4. **Run on device**
```bash
# Android
npm run android

# Web (development preview)
npm run web
```

## 📁 Project Structure

```
noteApp/
├── app/                    # Application pages and routing
│   ├── components/         # Component library
│   │   ├── features/       # Feature components
│   │   │   ├── categories/ # Category management
│   │   │   ├── editor/     # Editor components
│   │   │   ├── export/     # Export functionality
│   │   │   ├── notes/      # Note list
│   │   │   └── settings/   # Settings components
│   │   ├── ui/            # Common UI components
│   │   └── styles/        # Style files
│   ├── index.tsx          # Main page
│   ├── note-edit.tsx      # Note editing page
│   └── search.tsx         # Search page
├── src/                   # Core logic
│   ├── hooks/             # Custom Hooks
│   ├── utils/             # Utility functions
│   ├── types/             # Type definitions
│   └── constants/         # Configuration constants
├── assets/                # Static resources
├── docs/                  # Development documentation
└── i18n.ts               # Internationalization config
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Performance testing
npm run test:performance
```

## 📦 Build & Release

### Development Build
```bash
# Android APK
eas build --platform android --profile development
```

### Production Build
```bash
# Android AAB (Google Play)
eas build --platform android --profile production
```

## 🤝 Contributing

All forms of contributions are welcome! Please follow these steps:

1. Fork this project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

### Development Guidelines
- Use TypeScript for type checking
- Follow ESLint code standards
- Use React.memo for component performance optimization
- Organize code structure by feature modules

## 🗺️ Roadmap

### Completed ✅
- [x] Basic note functionality
- [x] Rich text editor
- [x] Category management system
- [x] Multi-format export
- [x] Search functionality
- [x] Internationalization support
- [x] Performance optimization
- [x] UI/UX optimization
- [x] New user onboarding notes

### Planned 📋
- [ ] Font size adjustment
- [ ] Task List functionality
- [ ] Paragraph spacing adjustment
- [ ] Table insertion feature
- [ ] Category drag-and-drop sorting
- [ ] Pin animation effects
- [ ] Export custom settings
- [ ] Global settings page
- [ ] AI assistant integration
- [ ] Trash/recycle bin feature
> More features to be determined...

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🎯 Project Goals

- 🎯 **Download Target**: 1000+ users

## About This Project

This is my first attempt at developing a mobile app. Initially, I just wanted to spend a few days creating a simple note-taking application as practice. Note-taking apps are considered classic beginner projects for mobile development - almost every indie developer encounters them during their learning phase. Today's app stores are already filled with various types of note-taking applications, and with AI's generative capabilities far exceeding beginner-level development skills, creating another wheel that AI could easily build seems to have lost its meaning. From today's perspective, making such an application might just be a form of self-entertainment.

But as development progressed, I encountered many tricky bugs and experienced moments of searching through documentation, communities, forums, and even open-source projects without finding any solutions. A week passed, and I found myself constantly imagining new features and continuously polishing details. I began to seriously want to create a truly useful note-taking application - even if it's just a little bit different, even if it's just to become a smooth, beautiful, and worthwhile product, rather than just a hastily completed exercise.

Why notes? Because I have a natural interest in note-taking and memo applications. I'm a heavy user of note-taking apps myself. Notes are not just records - they're an extension of thinking. Externalized thought chains and memories presented in text or image form relieve us from the burden of repeatedly recalling things in our minds. A well-organized note is far superior to long periods of contemplation. Human leap forward development is inseparable from the invention of writing systems; in today's world where everyone owns mobile devices, note-taking applications have become the most convenient writing tools, even becoming extensions of our brain functions.

During this project's development, I've also been constantly thinking of new features and discovering details that can be improved. Limited by personal abilities, some ideas can't be quickly implemented yet, but I still hope it can become a valuable product.

If this project helps you in any way, or if you like it, please give me a ⭐️. Thank you very much!

---


