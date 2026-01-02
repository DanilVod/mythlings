import { StyleSheet, Text, View } from 'react-native';

interface BattleTeamPowerProps {
  power: number;
  label?: string;
}

export function BattleTeamPower({ power, label }: BattleTeamPowerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label || 'TEAM'}</Text>
      <Text style={styles.powerLabel}>ВР:</Text>
      <Text style={styles.powerValue}>{power}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(30, 27, 75, 0.8)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: 'Bungee_400Regular',
  },
  powerLabel: {
    fontSize: 16,
    color: '#6366F1',
    marginRight: 4,
    fontFamily: 'Bungee_400Regular',
  },
  powerValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Bungee_400Regular',
  },
});
