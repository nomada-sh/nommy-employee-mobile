# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **nommy-employee**, an Expo SDK 53 React Native application representing a migration from the legacy "payjob" React Native CLI project. The app uses Expo Router for file-based routing and is built with TypeScript in strict mode.

## Commands

### Development Commands
```bash
# Start development server
npm start
# or
expo start

# Platform-specific development
npm run android    # Start with Android emulator/device
npm run ios        # Start with iOS simulator/device  
npm run web        # Start web development server

# Code quality
npm run lint       # ESLint with Expo flat config

# Project management
npm run reset-project    # Reset to blank app (moves current code to app-example/)
```

## Architecture

### Framework Stack
- **Expo SDK**: 53.0.22 with new architecture enabled
- **React Native**: 0.79.6 with React 19.0.0
- **Navigation**: Expo Router (file-based routing) + React Navigation
- **TypeScript**: Strict mode with `@/*` path aliases
- **Styling**: React Native components with themed system

### Project Structure
- `app/`: File-based routing system (Expo Router)
  - `app/_layout.tsx`: Root layout with theme provider and Stack navigator
  - `app/(tabs)/`: Tab-based navigation group
  - `app/+not-found.tsx`: 404 error screen
- `components/`: Reusable UI components
  - `ThemedText.tsx`, `ThemedView.tsx`: Theme-aware base components
  - `ui/`: Platform-specific UI components (IconSymbol, TabBarBackground)
- `hooks/`: Custom React hooks (`useColorScheme`, `useThemeColor`)
- `constants/Colors.ts`: Light/dark theme color definitions
- `assets/`: Static resources (fonts, images, icons)
- `scripts/reset-project.js`: Utility script for project reset

### Routing Architecture
Uses Expo Router with file-based routing:
- Root layout handles theme provider and font loading
- Tab layout in `(tabs)` group with Home and Explore screens
- Platform-specific components for iOS blur effects and haptic feedback
- Automatic dark/light theme switching

### Theme System
- Color scheme detection with platform-specific hooks
- Themed components that automatically adapt to light/dark mode
- Colors defined in `constants/Colors.ts` with light/dark variants
- Theme provider integration with React Navigation themes

### Key Dependencies
- **Navigation**: `@react-navigation/native`, `expo-router`
- **UI/UX**: `expo-haptics`, `expo-blur`, `react-native-reanimated`
- **System**: `expo-constants`, `expo-linking`, `expo-status-bar`
- **Platform**: Platform-specific implementations for iOS/Android/Web

## Configuration Files
- `app.json`: Expo app configuration with plugins and platform settings
- `tsconfig.json`: TypeScript config extending Expo base with strict mode
- `eslint.config.js`: ESLint flat config using expo preset
- `expo-env.d.ts`: Expo environment type definitions

## Development Notes
- Path aliases: `@/*` maps to project root
- New Architecture enabled for React Native
- Typed routes enabled in experiments
- Platform-specific components for iOS/Android/Web
- Reset project script available for starting fresh development