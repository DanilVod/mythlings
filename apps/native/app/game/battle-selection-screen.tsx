import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { MythlingType, MYTHLINGS } from '@/lib/mythling-types';
import { createPlayerTeam, generateEnemyTeam } from '@/lib/battle-types';
import { BattleButton } from '@/components/game/battle-button';

export default function BattleSelectionScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedMythlings, setSelectedMythlings] = useState<MythlingType[]>(
    [],
  );

  const toggleMythling = (type: MythlingType) => {
    if (selectedMythlings.includes(type)) {
      setSelectedMythlings(selectedMythlings.filter((m) => m !== type));
    } else if (selectedMythlings.length < 4) {
      setSelectedMythlings([...selectedMythlings, type]);
    }
  };

  const playerTeam = createPlayerTeam(selectedMythlings);
  const enemyTeam = generateEnemyTeam(1);

  const handleStartBattle = () => {
    router.push('/game/battle-screen');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientBackground}
      />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top,
          },
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
            <Text style={styles.headerIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>TEAM</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerIcon}>⚙</Text>
          </TouchableOpacity>
        </View>

        {/* BP Display */}
        <Text style={styles.bpLabel}>BP:{playerTeam.totalPower}</Text>

        {/* Player Team Display */}
        <View style={styles.teamCard}>
          {selectedMythlings.length > 0 ? (
            selectedMythlings.map((type) => {
              const mythling = MYTHLINGS.find((m) => m.type === type);
              return (
                <View key={type} style={styles.playerMythling}>
                  <Text style={styles.mythlingEmoji}>{mythling?.emoji}</Text>
                  <Text style={styles.mythlingLevel}>Lv1</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>
              {t('battleSelection.selectMythlings')}
            </Text>
          )}
        </View>

        {/* Enemy Team Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTextColumn}>
              <Text style={styles.floorText}>Floor 1</Text>
              <Text style={styles.foesText}>FOES</Text>
              <Text style={styles.bpText}>BP:{enemyTeam.totalPower}</Text>
            </View>
            <View style={styles.enemyTeam}>
              {enemyTeam.mythlings.map((mythling) => (
                <View key={mythling.id} style={styles.enemyMythling}>
                  <Text style={styles.enemyEmoji}>{mythling.emoji}</Text>
                  <Text style={styles.enemyLevel}>Lv1</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Selection Area */}
        <View style={styles.selectionCard}>
          <Text style={styles.selectionTitle}>CHOOSE PETS</Text>
          <ScrollView
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.mythlingList}
            style={styles.scrollView}>
            {MYTHLINGS.map((mythling) => {
              const isSelected = selectedMythlings.includes(mythling.type);
              return (
                <TouchableOpacity
                  key={mythling.type}
                  style={[
                    styles.mythlingCard,
                    isSelected && styles.selectedCard,
                  ]}
                  onPress={() => toggleMythling(mythling.type)}>
                  <Text style={styles.cardEmoji}>{mythling.emoji}</Text>
                  <Text style={styles.cardName}>{mythling.name}</Text>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Battle Button */}
        <View style={styles.buttonContainer}>
          <View
            style={[
              styles.buttonWrapper,
              selectedMythlings.length === 0 && styles.buttonWrapperDisabled,
            ]}>
            <BattleButton
              title='BATTLE'
              onPress={handleStartBattle}
              disabled={selectedMythlings.length === 0}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4F46E5',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  bpLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Saira_400Regular',
  },
  teamCard: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  playerMythling: {
    alignItems: 'center',
  },
  mythlingEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  mythlingLevel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontFamily: 'Bungee_400Regular',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 30,
    borderTopLeftRadius: 30,
    padding: 12,
    marginBottom: 16,
    gap: 16,
    width: '80%',
    alignSelf: 'flex-end',
  },
  sectionTextColumn: {
    flexDirection: 'column',
    gap: 8,
  },
  floorText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
  },
  foesText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
  },
  bpText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
  },
  enemyTeam: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    flex: 1,
  },
  enemyMythling: {
    alignItems: 'center',
  },
  enemyEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  enemyLevel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
  },
  selectionCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    flex: 1,
    paddingBottom: 80,
  },
  selectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    fontFamily: 'Bungee_400Regular',
  },
  scrollView: {
    flex: 1,
  },
  mythlingList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 4,
    paddingBottom: 20,
    flexGrow: 1,
  },
  mythlingCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    width: '48%',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  selectedCard: {
    borderColor: '#6366F1',
    backgroundColor: '#1E293B',
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: 6,
  },
  cardName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Bungee_400Regular',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  handCue: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  handEmoji: {
    fontSize: 48,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    alignItems: 'center',
  },
  buttonWrapper: {
    width: '100%',
    maxWidth: 320,
  },
  buttonWrapperDisabled: {
    opacity: 0.5,
  },
});
