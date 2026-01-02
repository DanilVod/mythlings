import { useEffect } from 'react';
import { router } from 'expo-router';
import { checkOnboardingCompleted } from '@/lib/game-storage';

export default function Index() {
  useEffect(() => {
    const checkAndRedirect = async () => {
      try {
        const hasCompletedOnboarding = await checkOnboardingCompleted();

        if (hasCompletedOnboarding) {
          // User has completed onboarding, go directly to home screen
          router.replace('/game/home-screen');
        } else {
          // New user, start onboarding flow
          router.replace('/game/start-screen');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Fallback to start screen on error
        router.replace('/game/start-screen');
      }
    };

    checkAndRedirect();
  }, []);

  return null;
}
