import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBudget } from '../context/BudgetContext';

const CATEGORY_CONFIG = {
  coffee: { icon: '☕', color: '#8B6914', label: 'Coffee & Drinks' },
  food: { icon: '🍽️', color: '#2d8a2d', label: 'Food & Dining' },
  shopping: { icon: '🛍️', color: '#1a6fd4', label: 'Shopping' },
  transport: { icon: '🚗', color: '#7c3aed', label: 'Transport' },
  default: { icon: '💳', color: '#666', label: 'Other' },
};

export default function InsightsScreen() {
  const { transactions, spent, budget, remaining } = useBudget();

  const categoryTotals = transactions.reduce((acc, tx) => {
    const cat = tx.category || 'default';
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += tx.amount;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a);

  const dailyAvg = transactions.length > 0 ? spent / 30 : 0;
  const projectedMonthly = dailyAvg * 30;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Overview cards */}
        <View style={styles.cardGrid}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Budget</Text>
            <Text style={styles.cardValue}>${budget.toLocaleString()}</Text>
            <Text style={styles.cardSub}>This month</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Spent</Text>
            <Text style={[styles.cardValue, { color: '#e53e3e' }]}>${spent.toFixed(2)}</Text>
            <Text style={styles.cardSub}>{((spent / budget) * 100).toFixed(1)}% used</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Remaining</Text>
            <Text style={[styles.cardValue, { color: '#2d8a2d' }]}>${remaining.toFixed(2)}</Text>
            <Text style={styles.cardSub}>Available</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Avg/Day</Text>
            <Text style={styles.cardValue}>${dailyAvg.toFixed(2)}</Text>
            <Text style={styles.cardSub}>At this pace</Text>
          </View>
        </View>

        {/* Spending by category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>

          {sortedCategories.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No spending data yet</Text>
            </View>
          ) : (
            sortedCategories.map(([cat, amount]) => {
              const config = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.default;
              const pct = spent > 0 ? (amount / spent) * 100 : 0;
              return (
                <View key={cat} style={styles.categoryRow}>
                  <View style={[styles.catIcon, { backgroundColor: config.color + '20' }]}>
                    <Text style={{ fontSize: 20 }}>{config.icon}</Text>
                  </View>
                  <View style={styles.catInfo}>
                    <View style={styles.catTopRow}>
                      <Text style={styles.catLabel}>{config.label}</Text>
                      <Text style={styles.catAmount}>-${amount.toFixed(2)}</Text>
                    </View>
                    <View style={styles.catBarBg}>
                      <View style={[styles.catBar, {
                        width: `${pct}%`,
                        backgroundColor: config.color,
                      }]} />
                    </View>
                    <Text style={styles.catPct}>{pct.toFixed(0)}% of spending</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Budget health */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget Health</Text>
          <View style={styles.healthCard}>
            <View style={styles.healthRow}>
              <Text style={styles.healthLabel}>📊 Budget utilization</Text>
              <Text style={styles.healthValue}>{((spent / budget) * 100).toFixed(1)}%</Text>
            </View>
            <View style={styles.healthRow}>
              <Text style={styles.healthLabel}>📅 Transactions this month</Text>
              <Text style={styles.healthValue}>{transactions.length}</Text>
            </View>
            <View style={styles.healthRow}>
              <Text style={styles.healthLabel}>💰 Projected monthly spend</Text>
              <Text style={[styles.healthValue, projectedMonthly > budget ? { color: '#e53e3e' } : { color: '#2d8a2d' }]}>
                ${projectedMonthly.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
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
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 14,
    margin: 2,
  },
  cardLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  cardValue: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 2 },
  cardSub: { fontSize: 11, color: '#bbb' },
  section: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 16 },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  catIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  catInfo: { flex: 1 },
  catTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  catLabel: { fontSize: 14, fontWeight: '500', color: '#111' },
  catAmount: { fontSize: 14, fontWeight: '600', color: '#e53e3e' },
  catBarBg: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginBottom: 4,
  },
  catBar: { height: 6, borderRadius: 3, minWidth: 4 },
  catPct: { fontSize: 11, color: '#999' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 14 },
  healthCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  healthLabel: { fontSize: 14, color: '#555' },
  healthValue: { fontSize: 14, fontWeight: '600', color: '#111' },
});
