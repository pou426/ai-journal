import {
    GoogleSignin,
    statusCodes,
} from '@react-native-google-signin/google-signin';
import { supabase } from '../utils/supabase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { IOS_CLIENT_ID } from '@env';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type RootStackParamList = {
    MainTabs: undefined;
};

type AuthProps = {
    navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default function Auth({ navigation }: AuthProps) {
    GoogleSignin.configure({
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        iosClientId: IOS_CLIENT_ID,
    })

    return (
        <TouchableOpacity 
            style={styles.button}
            onPress={async () => {
                try {
                    await GoogleSignin.hasPlayServices()
                    const userInfo = await GoogleSignin.signIn()
                    if (userInfo.data?.idToken) {
                        const { data, error } = await supabase.auth.signInWithIdToken({
                            provider: 'google',
                            token: userInfo.data.idToken,
                        })
                        if (error) {
                            console.error(error);
                            alert('Failed to sign in with Google');
                        } else {
                            // Navigate to MainTabs on successful sign in
                            navigation.replace('MainTabs');
                        }
                    } else {
                        throw new Error('no ID token present!')
                    }
                } catch (error: any) {
                    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                        // user cancelled the login flow
                    } else if (error.code === statusCodes.IN_PROGRESS) {
                        // operation (e.g. sign in) is in progress already
                    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                        // play services not available or outdated
                    } else {
                        // some other error happened
                        console.error(error);
                        alert('An error occurred during sign in');
                    }
                }
            }}
        >
            <MaterialCommunityIcons name="google" size={24} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Sign in with Google</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#333',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 8,
        minWidth: 200,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    icon: {
        marginRight: 12,
    },
});