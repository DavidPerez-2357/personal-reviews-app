import type {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.personalreview.app',
    appName: 'Personal Reviews',
    webDir: 'dist',
    plugins: {
        CapacitorSQLite: {
            androidDatabaseLocation: "default",
        },
        SplashScreen: {
            launchShowDuration: 0,
            launchAutoHide: true,
            launchFadeOutDuration: 0,
            backgroundColor: "#222831FF",
            androidScaleType: "CENTER_CROP",
            showSpinner: false,
            splashFullScreen: true,
            splashImmersive: true,
        },
    },
};

export default config;
