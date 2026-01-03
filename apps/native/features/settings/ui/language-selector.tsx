import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { getCurrentLanguage } from '@/shared/config/i18n';
import { AnimatedButton } from '@/shared/ui/animated-button';
import { changeLanguage } from 'i18next';

const AnimatedView = Animated.createAnimatedComponent(View);

export function LanguageSelector() {
  const opacity = useSharedValue(0);
  const { t } = useTranslation();
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 600 });
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleLanguageChange = async () => {
    const newLang = currentLang === 'en' ? 'ru' : 'en';
    await changeLanguage(newLang);
    setCurrentLang(newLang);
  };

  return (
    <AnimatedView style={[styles.container, animatedStyle]}>
      <AnimatedButton onPress={handleLanguageChange} style={styles.button}>
        <Ionicons name='globe-outline' size={20} color='#FFFFFF' />
        <Text style={styles.text}>
          {t('language.' + (currentLang === 'en' ? 'english' : 'russian'))}
        </Text>
      </AnimatedButton>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
