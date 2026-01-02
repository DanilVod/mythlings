import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { GradientBackground } from '@/components/game/gradient-background';
import { MythlingType } from '@/lib/mythling-types';
import { useAuth } from '@/contexts/AuthContext';
import { useGameData } from '@/contexts/GameDataContext';
import { syncLocalDataToServer } from '@/lib/game-storage';

type AuthMode = 'signIn' | 'signUp';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const {
    isAuthenticated,
    isLoading: authLoading,
    signIn,
    signUp,
    signOut,
  } = useAuth();
  const { profile, updateProfile } = useGameData();

  const [username, setUsername] = useState('');
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
    }
  }, [profile]);

  const handleUsernameSave = async () => {
    if (username.trim().length < 2) {
      Alert.alert(t('settings.usernameError'), t('settings.nameTooShort'));
      return;
    }

    if (username.trim().length > 20) {
      Alert.alert(t('settings.usernameError'), t('settings.nameTooLong'));
      return;
    }

    try {
      await updateProfile({ username: username.trim() });
      Alert.alert(t('settings.usernameUpdated'));
    } catch (error) {
      console.error('Error updating username:', error);
      Alert.alert(t('settings.usernameError'));
    }
  };

  const handleAuthSubmit = async () => {
    if (!email || !password) {
      Alert.alert(t('settings.authError'), t('settings.emailRequired'));
      return;
    }

    if (authMode === 'signUp') {
      if (!confirmPassword) {
        Alert.alert(
          t('settings.authError'),
          t('settings.confirmPasswordRequired'),
        );
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert(t('settings.authError'), t('settings.passwordsDoNotMatch'));
        return;
      }
    }

    setIsLoading(true);

    try {
      if (authMode === 'signUp') {
        await signUp(email, password, username);
      } else {
        await signIn(email, password);
      }

      // Sync local data to server after successful auth
      await syncLocalDataToServer();

      setShowAuthForm(false);
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      Alert.alert(t('settings.syncSuccess'));
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert(t('settings.authError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    Alert.alert(
      t('settings.disconnectAccount'),
      'Are you sure you want to disconnect your account?',
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert(t('settings.authError'));
            }
          },
        },
      ],
    );
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Text style={styles.title}>{t('settings.title')}</Text>

          {/* Username Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('settings.changeUsername')}
            </Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder={t('settings.usernamePlaceholder')}
              placeholderTextColor='#999999'
              style={styles.input}
              maxLength={20}
              autoCapitalize='none'
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUsernameSave}>
              <Text style={styles.saveButtonText}>{t('settings.save')}</Text>
            </TouchableOpacity>
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.account')}</Text>

            {isAuthenticated ? (
              <View style={styles.accountStatus}>
                <Text style={styles.statusText}>{t('settings.connected')}</Text>
                <TouchableOpacity
                  style={styles.disconnectButton}
                  onPress={handleDisconnect}>
                  <Text style={styles.disconnectButtonText}>
                    {t('settings.disconnectAccount')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.accountStatus}>
                <Text style={styles.statusText}>
                  {t('settings.notConnected')}
                </Text>
                <TouchableOpacity
                  style={styles.connectButton}
                  onPress={() => setShowAuthForm(true)}>
                  <Text style={styles.connectButtonText}>
                    {t('settings.connectAccount')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Auth Form */}
          {showAuthForm && !isAuthenticated && (
            <View style={styles.section}>
              <View style={styles.authModeToggle}>
                <TouchableOpacity
                  style={[
                    styles.authModeButton,
                    authMode === 'signIn' && styles.authModeButtonActive,
                  ]}
                  onPress={() => setAuthMode('signIn')}>
                  <Text
                    style={[
                      styles.authModeButtonText,
                      authMode === 'signIn' && styles.authModeButtonTextActive,
                    ]}>
                    {t('settings.signIn')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.authModeButton,
                    authMode === 'signUp' && styles.authModeButtonActive,
                  ]}
                  onPress={() => setAuthMode('signUp')}>
                  <Text
                    style={[
                      styles.authModeButtonText,
                      authMode === 'signUp' && styles.authModeButtonTextActive,
                    ]}>
                    {t('settings.signUp')}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>{t('settings.email')}</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={t('settings.emailPlaceholder')}
                placeholderTextColor='#999999'
                style={styles.input}
                autoCapitalize='none'
                autoCorrect={false}
                keyboardType='email-address'
              />

              <Text style={styles.label}>{t('settings.password')}</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={t('settings.passwordPlaceholder')}
                placeholderTextColor='#999999'
                style={styles.input}
                secureTextEntry
                autoCapitalize='none'
                autoCorrect={false}
              />

              {authMode === 'signUp' && (
                <>
                  <Text style={styles.label}>
                    {t('settings.confirmPassword')}
                  </Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder={t('settings.confirmPasswordPlaceholder')}
                    placeholderTextColor='#999999'
                    style={styles.input}
                    secureTextEntry
                    autoCapitalize='none'
                    autoCorrect={false}
                  />
                </>
              )}

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  isLoading && styles.saveButtonDisabled,
                ]}
                onPress={handleAuthSubmit}
                disabled={isLoading}>
                <Text style={styles.saveButtonText}>
                  {isLoading
                    ? authMode === 'signIn'
                      ? t('settings.signingIn')
                      : t('settings.signingUp')
                    : authMode === 'signIn'
                    ? t('settings.signIn')
                    : t('settings.signUp')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAuthForm(false);
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                }}>
                <Text style={styles.cancelButtonText}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: 'Bungee_400Regular',
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    fontFamily: 'Bungee_400Regular',
  },
  label: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#000000',
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Bungee_400Regular',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Bungee_400Regular',
  },
  accountStatus: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
    fontFamily: 'Bungee_400Regular',
  },
  connectButton: {
    backgroundColor: '#00B4D8',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Bungee_400Regular',
  },
  disconnectButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  disconnectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Bungee_400Regular',
  },
  authModeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  authModeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  authModeButtonActive: {
    backgroundColor: '#FF6B35',
  },
  authModeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Bungee_400Regular',
  },
  authModeButtonTextActive: {
    color: '#FFFFFF',
  },
});
