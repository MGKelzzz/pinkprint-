# PINKPRINT 🩷🐆

**Your life. Your patterns. Your blueprint.**

PINKPRINT is a personal-growth and self-discovery app designed around self-directed change—not a personality makeover. Its visual direction is hot pink and black with a cheetah-print pattern, neon accents, and a bold Y2K feel. The print is a pattern, not a cheetah illustration.

## Current app features

- **Home:** daily focus, mood check-in, daily reset checklist, XP/levels, and an affirmation.
- **Me:** editable self-discovery prompts for values, identity, what you're ready to outgrow, and what you want more of.
- **Coach:** guided offline reflection prompts for thinking clearly, planning a next step, confidence, and getting unstuck. This is a local reflection tool, not a connected AI service or therapist.
- **Create Studio:** private journal entries, a text-based vision board, and locally saved blog drafts.
- **Goals:** add, complete, and delete goals; completion earns XP.
- **Journey:** a timeline assembled from journal entries, completed goals, saved reflections, and vision-board items.
- **Local persistence:** personal content is saved on the device with AsyncStorage. No account or paid service is required for these core features.

## Important scope notes

- The vision board currently stores text and intentions; it does not yet support photo uploads, drag-and-drop collage editing, or stickers.
- Blog Studio saves drafts locally. WordPress login, media uploads, scheduling, and publishing are not connected.
- Coach guidance is currently offline and template-based. There is no live AI model connection.
- Data is stored locally on the device. Uninstalling the app or clearing app storage may erase it; cloud sync and encrypted backup are not implemented.
- This repository is source code, not proof that a new APK has successfully built. A build must complete successfully before an APK can be called ready.

## Run the app

1. Install Node.js 20 or newer.
2. Clone this repository and enter its folder.
3. Run `npm install`.
4. Run `npx expo start`.
5. Open it with Expo Go or a configured Android development environment.

## Android APK

The project uses Expo SDK 54. To produce a release APK locally, generate the native Android project with `npx expo prebuild --platform android`, then run `cd android && ./gradlew assembleRelease` on a machine with the Android build requirements installed. The output is normally `android/app/build/outputs/apk/release/app-release.apk`.

## Before calling it finished

A production-ready release still needs a successful clean build, device testing on the intended Samsung Galaxy Fold, accessibility and small-screen checks, validation of persistence/error handling, a privacy/data-export plan, and implementation or explicit removal of unfinished integrations (AI Coach, photo-based vision boards, and WordPress publishing).
