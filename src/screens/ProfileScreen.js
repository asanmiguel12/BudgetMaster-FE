import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBudget, formatTimeframe } from '../context/BudgetContext';

export default function ProfileScreen() {
  const { budget, timeframe, budgetName } = useBudget();
  const timeframeLabel = formatTimeframe(timeframe) || 'Monthly';
  const budgetLabel = budgetName || timeframeLabel;
  const [notifications, setNotifications] = React.useState(true);
  const [bankSync, setBankSync] = React.useState(true);
  const [weeklyReport, setWeeklyReport] = React.useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>john.doe@email.com</Text>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Budget settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget Settings</Text>
          <View style={styles.settingsGroup}>
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingIcon}>💰</Text>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>{budgetLabel}</Text>
                <Text style={styles.settingValue}>
                  ${budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingIcon}>🏦</Text>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Connected Bank</Text>
                <Text style={styles.settingValue}>Your Bank ••••4242</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingIcon}>📂</Text>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Budget Categories</Text>
                <Text style={styles.settingValue}>Manage categories</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingsGroup}>
            <View style={styles.settingRow}>
              <Text style={styles.settingIcon}>🔔</Text>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Bank notifications</Text>
                <Text style={styles.settingValue}>Get alerts on new charges</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#ddd', true: '#1a6fd4' }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <Text style={styles.settingIcon}>🔄</Text>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Auto-sync transactions</Text>
                <Text style={styles.settingValue}>Sync from bank automatically</Text>
              </View>
              <Switch
                value={bankSync}
                onValueChange={setBankSync}
                trackColor={{ false: '#ddd', true: '#1a6fd4' }}
                thumbColor="#fff"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <Text style={styles.settingIcon}>📊</Text>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Weekly report</Text>
                <Text style={styles.settingValue}>Summary every Monday</Text>
              </View>
              <Switch
                value={weeklyReport}
                onValueChange={setWeeklyReport}
                trackColor={{ false: '#ddd', true: '#1a6fd4' }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#111' },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a6fd4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '600', color: '#111', marginBottom: 4 },
  email: { fontSize: 14, color: '#999', marginBottom: 16 },
  editBtn: {
    borderWidth: 1.5,
    borderColor: '#1a6fd4',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  editBtnText: { color: '#1a6fd4', fontSize: 14, fontWeight: '600' },
  section: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#999', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  settingsGroup: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  settingIcon: { fontSize: 20, marginRight: 12 },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '500', color: '#111', marginBottom: 2 },
  settingValue: { fontSize: 12, color: '#999' },
  chevron: { fontSize: 20, color: '#ccc' },
  divider: { height: 0.5, backgroundColor: '#eee', marginLeft: 46 },
  signOutBtn: {
    margin: 20,
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  signOutText: { color: '#e53e3e', fontSize: 16, fontWeight: '600' },
});
