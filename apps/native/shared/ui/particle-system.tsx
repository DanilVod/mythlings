import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const PARTICLE_COUNT = 25;

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

function generateParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.3,
      duration: 8000 + Math.random() * 4000,
      delay: Math.random() * 2000,
    });
  }
  return particles;
}

function Particle({ particle }: { particle: Particle }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(particle.opacity);

  React.useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-20, { duration: particle.duration }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: `rgba(255, 255, 255, ${particle.opacity})`,
        },
        animatedStyle,
      ]}
    />
  );
}

export function ParticleSystem() {
  const particles = useMemo(() => generateParticles(), []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents='none'>
      {particles.map((particle) => (
        <Particle key={particle.id} particle={particle} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
  },
});
