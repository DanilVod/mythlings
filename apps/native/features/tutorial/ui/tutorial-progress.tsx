import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface TutorialProgressProps {
  currentFloor: number;
  totalFloors: number;
}

export function TutorialProgress({
  currentFloor,
  totalFloors,
}: TutorialProgressProps) {
  const { t } = useTranslation();
  const progress = (currentFloor / totalFloors) * 100;

  return (
    <View style={styles.container}>
      {/* Monster Character Image */}
      <View style={styles.characterContainer}>
        <View style={styles.character}>
          {/* Monster body */}
          <View style={styles.monsterBody}>
            {/* Monster eyes */}
            <View style={styles.eye} />
            <View style={styles.eye} />
            {/* Monster mouth */}
            <View style={styles.mouth} />
          </View>
        </View>
      </View>

      {/* Progress Info */}
      <View style={styles.progressInfo}>
        <Text style={styles.title}>{t('tutorial.title')}</Text>
        <Text style={styles.progressText}>
          {t('tutorial.floor')} {currentFloor}/{totalFloors}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4A90E2',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  characterContainer: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  character: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monsterBody: {
    width: 50,
    height: 50,
    backgroundColor: '#2ECC71',
    borderRadius: 25,
    position: 'relative',
  },
  eye: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    top: 12,
  },
  mouth: {
    position: 'absolute',
    width: 20,
    height: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    bottom: 10,
    left: 15,
  },
  progressInfo: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
});
