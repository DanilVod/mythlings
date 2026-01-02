import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export function Character() {
  const scale = useSharedValue(0.8);
  const translateY = useSharedValue(0);
  const walkCycle = useSharedValue(0);

  useEffect(() => {
    // Entry animation: scale in with spring
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });

    // Idle bounce animation
    translateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1250 }),
        withTiming(0, { duration: 1250 }),
      ),
      -1,
      true,
    );

    // Walking animation cycle
    walkCycle.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(-1, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Path/Ground */}
      <View style={styles.path} />

      {/* Main Character Body */}
      <View style={styles.characterContainer}>
        {/* Plant on head */}
        <View style={styles.plant}>
          <View style={styles.plantStem} />
          <View
            style={[styles.plantLeaf, { transform: [{ rotate: '-30deg' }] }]}
          />
          <View
            style={[styles.plantLeaf, { transform: [{ rotate: '30deg' }] }]}
          />
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Eye */}
          <View style={styles.eye}>
            <View style={styles.pupil} />
          </View>

          {/* Blue Collar */}
          <View style={styles.collar} />
        </View>

        {/* Legs */}
        <View style={styles.legsContainer}>
          <View style={styles.leg} />
          <View style={styles.leg} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  path: {
    position: 'absolute',
    bottom: 20,
    width: 180,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
  characterContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  plant: {
    position: 'absolute',
    top: -30,
    zIndex: 2,
  },
  plantStem: {
    width: 4,
    height: 20,
    backgroundColor: '#2ECC71',
    alignSelf: 'center',
  },
  plantLeaf: {
    position: 'absolute',
    top: 5,
    width: 20,
    height: 10,
    backgroundColor: '#27AE60',
    borderRadius: 5,
  },
  body: {
    width: 100,
    height: 90,
    backgroundColor: '#1A1A1A',
    borderRadius: 50,
    position: 'relative',
    borderWidth: 3,
    borderColor: '#2C3E50',
  },
  eye: {
    position: 'absolute',
    width: 36,
    height: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    top: 20,
    left: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2C3E50',
  },
  pupil: {
    width: 18,
    height: 18,
    backgroundColor: '#000000',
    borderRadius: 9,
  },
  collar: {
    position: 'absolute',
    bottom: -5,
    left: 10,
    width: 80,
    height: 20,
    backgroundColor: '#3498DB',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2980B9',
  },
  legsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 60,
    marginTop: -5,
  },
  leg: {
    width: 12,
    height: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2C3E50',
  },
});
