# shashi-payroll

## Android Build & Release Workflow

### 1. Make Code Changes
- Edit your code in the `src/` directory or elsewhere as needed.
- Update assets (icons, splash, etc.) if required.
- If you change dependencies, run:
  ```sh
  npm install
  ```

### 2. (Optional) Update Version
- Update the version in `app.json` and `android/app/build.gradle`:
  - In `app.json`:
    ```json
    "version": "1.0.1"
    ```
  - In `android/app/build.gradle`:
    ```groovy
    versionCode 2
    versionName "1.0.1"
    ```
  - Increment `versionCode` for every Play Store release.

### 3. Build APK or AAB
- From your project root, run:
  ```sh
  cd android
  ./gradlew assembleRelease
  ```
  - APK will be at: `android/app/build/outputs/apk/release/app-release.apk`
- For Play Store, build an AAB:
  ```sh
  ./gradlew bundleRelease
  ```
  - AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

### 4. Test the APK
- Install the APK on your device:
  ```sh
  adb install -r app/build/outputs/apk/release/app-release.apk
  ```
  (Enable USB debugging and connect your device.)

### 5. Release to Play Store
- Upload the `.aab` file to the [Google Play Console](https://play.google.com/console/).
- Create a new release, upload the AAB, fill in release notes, and roll out to production.

### 6. (Optional) Clean the Build
- If you encounter build errors, clean the build:
  ```sh
  ./gradlew clean
  ```
  Then build again.

### 7. Summary of Commands
```sh
npm install
# (Optional) Update version in app.json and build.gradle
cd android
./gradlew assembleRelease   # For APK
./gradlew bundleRelease      # For AAB (Play Store)
./gradlew clean              # Clean build (if needed)
```

---

If you need to automate these steps or need help with any part of the workflow, see the comments above or ask for more details!
