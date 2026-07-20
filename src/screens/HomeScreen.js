import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CashStack from '../components/CashStack';
import { useBudget, formatTimeframe } from '../context/BudgetContext';

function TransactionRow({ transaction }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatDate = (date) => {
    return (
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ', ' +
      date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    );
  };

  return (
    <Animated.View style={[styles.txRow, { opacity: fadeAnim }]}>
      <View style={[styles.txIcon, { backgroundColor: transaction.color + '20' }]}>
        <Text style={{ fontSize: 20 }}>
          {transaction.category === 'coffee' ? '☕' : '🍽️'}
        </Text>
      </View>

      <View style={styles.txInfo}>
        <Text style={styles.txMerchant}>{transaction.merchant}</Text>
        <Text style={styles.txDate}>{formatDate(transaction.date)}</Text>
      </View>

      <Text style={styles.txAmount}>-${transaction.amount.toFixed(2)}</Text>
    </Animated.View>
  );
}

export default function HomeScreen({ navigation }) {
  const {
    budget, spent, remaining, percentRemaining, timeframe,
    transactions, pendingTransaction, isAnimating,
    simulateBankNotification,
  } = useBudget();

  const [showSummary, setShowSummary] = useState(false);
  const timeframeLabel = formatTimeframe(timeframe);

  const cashRef = useRef(null);

  const processingOpacity = useRef(new Animated.Value(0)).current;
  const summaryScale = useRef(new Animated.Value(0.8)).current;
  const summaryOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pendingTransaction && isAnimating) {
      cashRef.current?.deduct(pendingTransaction.amount);
    }
  }, [pendingTransaction, isAnimating]);

  useEffect(() => {
    if (isAnimating) {
      setShowSummary(false);
      Animated.loop(
        Animated.sequence([
          Animated.timing(processingOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(processingOpacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      processingOpacity.stopAnimation();
      processingOpacity.setValue(0);

      if (transactions.length > 0) {
        setShowSummary(true);
        Animated.parallel([
          Animated.spring(summaryScale, { toValue: 1, useNativeDriver: true }),
          Animated.timing(summaryOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();
      }
    }
  }, [isAnimating]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Budget Me</Text>

        <TouchableOpacity style={styles.bellBtn}>
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>

        {/* Summary */}
        {showSummary ? (
          <Animated.View style={[styles.summaryCard, {
            transform: [{ scale: summaryScale }],
            opacity: summaryOpacity,
          }]}>
            <Text style={styles.summaryLabel}>Remaining Budget</Text>
            <Text style={styles.summaryBudget}>
              ${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>

            <View style={styles.summaryRow}>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatLabel}>Spent</Text>
                <Text style={styles.summaryStatValue}>${spent.toFixed(2)}</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatLabel}>Overall Budget</Text>
                <Text style={styles.summaryStatValue}>${budget.toFixed(2)}</Text>
              </View>
            </View>
          </Animated.View>
        ) : (
          <View style={styles.budgetHeader}>
            <Text style={styles.overallLabel}>Overall Budget</Text>
            <Text style={styles.budgetAmount}>
              ${budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.thisMonth}>{timeframeLabel}</Text>
          </View>
        )}

        {/* Deducting label */}
        {isAnimating && pendingTransaction && (
          <Animated.Text style={[styles.processingText, { opacity: processingOpacity }]}>
            Deducting ${pendingTransaction.amount.toFixed(2)}...
          </Animated.Text>
        )}

        {/* Cash Stack */}
        <View style={styles.cashArea}>

{/* Stylized table shape  (Not displaying properly) */}
<View style={styles.tableShape} />

{/* Stacks on top */}
<View style={styles.stackWrapper}>
  <CashStack
    onRef={(api) => (cashRef.current = api)}
    percentRemaining={parseFloat(percentRemaining)}
  />
</View>

</View>


        {/* Demo button */}
        <TouchableOpacity
          style={styles.demoButton}
          onPress={simulateBankNotification}
          disabled={isAnimating}
        >
          <Text style={styles.demoButtonText}>
            {isAnimating ? 'Processing...' : '💳 Simulate Bank Notification'}
          </Text>
        </TouchableOpacity>

        {/* ⭐ RECENT ACTIVITY BOX ⭐ */}
        <View style={styles.activityContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Activity')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {transactions.slice(0, 5).map(tx => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------------------------------------
   STYLES
--------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },

  menuBtn: { padding: 4 },
  menuIcon: { fontSize: 20, color: '#333' },
  bellBtn: { padding: 4 },
  bellIcon: { fontSize: 20 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111' },

  budgetHeader: { alignItems: 'center', paddingTop: 24, paddingBottom: 8 },
  overallLabel: { fontSize: 13, color: '#888', marginBottom: 4 },
  budgetAmount: { fontSize: 36, fontWeight: '700', color: '#2a8a2a', letterSpacing: -1 },
  thisMonth: { fontSize: 13, color: '#888', marginTop: 2 },

  summaryCard: {
    margin: 16,
    backgroundColor: '#1a6fd4',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 5,
    alignItems: 'center',
  },

  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 4 },
  summaryBudget: { color: '#fff', fontSize: 32, fontWeight: '700', marginBottom: 16 },

  summaryRow: { flexDirection: 'row', width: '100%' },
  summaryStat: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  summaryStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 2 },
  summaryStatValue: { color: '#fff', fontSize: 18, fontWeight: '600' },

  processingText: {
    textAlign: 'center',
    color: '#1a6fd4',
    fontSize: 15,
    fontWeight: '500',
    marginTop: 8,
  },

  cashArea: { paddingHorizontal: 20, paddingVertical: 16 },

  /* ⭐ NEW ACTIVITY BOX ⭐ */
  activityContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },

    elevation: 4,
  },

  // tableShape: {
  //   width: '90%',
  //   height: 60,
  //   backgroundColor: '#8B5A2B',   // brown fill
  //   borderRadius: 12,
  //   transform: [{ skewX: '-100deg'}], // gives diagonal edges
  //   marginTop: 10,
  // },

  // stackWrapper: {
  //   marginTop: -40,   // pulls stacks down onto the shape
  //   alignItems: 'center',
  // },
  
  

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111' },
  viewAll: { fontSize: 14, color: '#1a6fd4', fontWeight: '500' },

  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txInfo: { flex: 1 },
  txMerchant: { fontSize: 15, fontWeight: '500', color: '#111', marginBottom: 2 },
  txDate: { fontSize: 12, color: '#999' },
  txAmount: { fontSize: 15, fontWeight: '600', color: '#e53e3e' },

  demoButton: {
    margin: 20,
    marginTop: 24,
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1a6fd4',
    borderStyle: 'dashed',
  },
  demoButtonText: { color: '#1a6fd4', fontSize: 15, fontWeight: '600' },
});
