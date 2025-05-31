# Personal Reviews
It's an app where you can save your reviews of products, services, experiences... or anything! You can rate an item in different aspects depending on the category they're associated with, for example for videogames you can rate plot, gameplay and graphics separately. Since your opinion can change over time, you can add multiple reviews to a single product and later see them in a timeline. Items can have an origin, which is where the item came from, for example, for a car its origin can be its brand.


## ⚙️ Initial Developer Setup

Make sure you have [Node.js](https://nodejs.org/en) version **21 or higher** installed.

Install all project dependencies:

```bash
npm install
```
<br>

Install [Ionic CLI](https://ionicframework.com/) globally:
```bash
npm i -g @ionic/cli
```

<br>

## 🔧 Android Setup
Make sure you have [Android Studio](https://developer.android.com/studio?hl=es-419) installed and properly configured.



Set up the Android platform by running:
```bash
npx cap add android
ionic build
npx cap sync android
```

<br>

Generate and sync media assets:
```bash
 npx @capacitor/assets generate
 npx cap sync
 ```

<br>

Open android studio:
```bash
npx cap open android
```

<br>

### 📱 Splash screen configurations
Modify file `/android/capacitor-android/res/values/colors.xml` and add this color:

```xml
<color name="my_launch_background">#222831</color>
```
<br>

Create file `splash_background.xml` in `/android/app/res/drawable` with this content:

```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Background color -->
    <item android:drawable="@color/my_launch_background" />

    <!-- Splash image, centered without stretching -->
    <item>
        <bitmap
            android:gravity="center"
            android:src="@drawable/splash" />
    </item>
</layer-list>
```
<br>

Modify file `/android/app/res/values/styles.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Base application theme. -->
    <style name="AppTheme" parent="Theme.AppCompat.NoActionBar">
        <item name="colorPrimary">@color/colorPrimary</item>
        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
        <item name="colorAccent">@color/colorAccent</item>

        <!-- Window background -->
        <item name="android:windowBackground">@color/my_launch_background</item>
        <item name="android:windowNoTitle">true</item>
        <item name="android:windowFullscreen">true</item>
    </style>

    <style name="AppTheme.NoActionBarLaunch" parent="Theme.AppCompat.NoActionBar">
        <!-- Splash screen styles -->
        <item name="android:windowBackground">@drawable/splash_background</item>
        <item name="android:windowNoTitle">true</item>
        <item name="android:windowFullscreen">true</item>
        <item name="android:windowActionBar">false</item>
        <item name="android:windowContentOverlay">@null</item>
    </style>
</resources>
```
