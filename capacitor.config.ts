import type {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'io.ionic.starter',
    appName: 'personal-review-app',
    webDir: 'dist',
    plugins: {
        CapacitorSQLite: {
            androidDatabaseLocation: "default",
        },
        SplashScreen: {
            launchShowDuration: 1000,
            launchAutoHide: true,
            launchFadeOutDuration: 300,
            backgroundColor: "#222831FF",
            androidScaleType: "CENTER_CROP",
            showSpinner: true,
            androidSpinnerStyle: "large",
            iosSpinnerStyle: "small",
            spinnerColor: "#00ADB5FF",
            splashFullScreen: true,
            splashImmersive: true,
        },
    },
};

export default config;
