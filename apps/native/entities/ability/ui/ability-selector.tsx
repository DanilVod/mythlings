import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ability } from '@/lib/battle-types';

interface AbilitySelectorProps {
  abilities: Ability[];
  selectedAbility: Ability | null;
  onSelectAbility: (ability: Ability) => void;
  disabled?: boolean;
}

export function AbilitySelector({
  abilities,
  selectedAbility,
  onSelectAbility,
  disabled = false,
}: AbilitySelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ABILITIES</Text>
      <View style={styles.abilitiesList}>
        {abilities.map((ability) => {
          const isSelected = selectedAbility?.id === ability.id;
          return (
            <TouchableOpacity
              key={ability.id}
              style={[
                styles.abilityCard,
                isSelected && styles.selectedCard,
                disabled && styles.disabledCard,
              ]}
              onPress={() => !disabled && onSelectAbility(ability)}
              disabled={disabled}
              activeOpacity={0.8}>
              <View style={styles.abilityHeader}>
                <Text style={styles.icon}>{ability.icon}</Text>
                <View style={styles.abilityInfo}>
                  <Text style={styles.name}>{ability.name}</Text>
                  <Text style={styles.damage}>DMG: {ability.damage}</Text>
                </View>
              </View>
              <Text style={styles.description}>{ability.description}</Text>
              <View style={styles.cooldownContainer}>
                <Text style={styles.cooldownLabel}>CD:</Text>
                <Text style={styles.cooldown}>{ability.cooldown}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(30, 27, 75, 0.95)',
    borderTopWidth: 2,
    borderTopColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    fontFamily: 'Bungee_400Regular',
  },
  abilitiesList: {
    flexDirection: 'row',
    gap: 12,
  },
  abilityCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#4B5563',
  },
  selectedCard: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  disabledCard: {
    opacity: 0.5,
  },
  abilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  abilityInfo: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: 'Bungee_400Regular',
  },
  damage: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: 'bold',
    fontFamily: 'Bungee_400Regular',
  },
  description: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    fontFamily: 'Bungee_400Regular',
  },
  cooldownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cooldownLabel: {
    fontSize: 12,
    color: '#6366F1',
    marginRight: 4,
    fontWeight: 'bold',
    fontFamily: 'Bungee_400Regular',
  },
  cooldown: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'Bungee_400Regular',
  },
});
