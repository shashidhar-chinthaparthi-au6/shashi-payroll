# Payroll Mobile App

A React Native mobile application for employees to manage their attendance and view payslips.

## Features

- User authentication
- QR code-based attendance marking
- Attendance history viewing
- Payslip viewing and downloading
- Modern and intuitive UI

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator

## Installation

1. Clone the repository
2. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the App

1. Start the development server:
   ```bash
   npm start
   ```
2. Press 'i' to run on iOS simulator or 'a' to run on Android emulator

## Project Structure

```
src/
  ├── components/     # Reusable components
  ├── navigation/     # Navigation configuration
  ├── screens/        # Screen components
  ├── services/       # API services
  ├── store/          # Redux store and slices
  ├── types/          # TypeScript type definitions
  └── utils/          # Utility functions
```

## Dependencies

- React Native
- Expo
- Redux Toolkit
- React Navigation
- React Native Camera
- Axios
- AsyncStorage

## API Integration

The app connects to the payroll backend server. Make sure to update the API_URL in `src/services/api.ts` to match your server's address.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 