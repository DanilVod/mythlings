import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GradientBackground } from '@/components/game/gradient-background';
import { MythlingType } from '@/lib/mythling-types';
import { updateGameProfile, completeOnboarding } from '@/lib/game-storage';

export default function UsernameSelectionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const [username, setUsername] = useState('');

  const handleUsernameChange = (text: string) => {
    setUsername(text);
  };

  const handleSubmit = async () => {
    if (username.trim().length >= 2) {
      try {
        // Save username and complete onboarding
        await updateGameProfile({
          username: username.trim(),
        });

        // Mark onboarding as completed
        await completeOnboarding();

        console.log('Username saved:', username);
        router.replace('/game/home-screen');
      } catch (error) {
        console.error('Error saving username:', error);
        // Still navigate even if save fails
        router.replace('/game/home-screen');
      }
    }
  };

  return (
    <View style={styles.container}>
      <GradientBackground mythlingType={MythlingType.FIRE} />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 32,
          },
        ]}>
        <Text style={styles.title}>{t('usernameSelection.title')}</Text>

        <TextInput
          value={username}
          onChangeText={handleUsernameChange}
          placeholder={t('usernameSelection.placeholder')}
          placeholderTextColor='#999999'
          style={styles.input}
          maxLength={20}
          autoCapitalize='none'
          autoCorrect={false}
          onSubmitEditing={handleSubmit}
          returnKeyType='done'
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B4B',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 48,
    textAlign: 'center',
    fontFamily: 'Bungee_400Regular',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    paddingVertical: 20,
    paddingHorizontal: 32,
    fontSize: 20,
    color: '#000000',
    textAlign: 'center',
    width: '100%',
    maxWidth: 400,
    fontFamily: 'Bungee_400Regular',
  },
});
