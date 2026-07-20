import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CashStack from '../components/CashStack';
import BudgetDualCard from '../components/BudgetDualCard';
import TimeframeProgressBar from '../components/TimeframeProgressBar';
import { useBudget, getOnTrackProgressForDaysRemaining } from '../context/BudgetContext';

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
    budget, remaining, timeframe,
    daysRemaining, totalDays,
    transactions, pendingTransaction, isAnimating,
    simulateBankNotification,
  } = useBudget();

  const actualDaysElapsed = Math.max(0, totalDays - daysRemaining);
  const [previewDaysElapsed, setPreviewDaysElapsed] = useState(null);

  const displayOnTrackProgress = useMemo(() => {
    const elapsed = previewDaysElapsed ?? actualDaysElapsed;
    const previewDaysRemaining = Math.max(0, totalDays - elapsed);
    return getOnTrackProgressForDaysRemaining(budget, remaining, totalDays, previewDaysRemaining);
  }, [previewDaysElapsed, actualDaysElapsed, totalDays, budget, remaining]);

  const cashRef = useRef(null);

  const processingOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pendingTransaction && isAnimating) {
      cashRef.current?.deduct(pendingTransaction.amount);
    }
  }, [pendingTransaction, isAnimating]);

  useEffect(() => {
    if (isAnimating) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(processingOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(processingOpacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      processingOpacity.stopAnimation();
      processingOpacity.setValue(0);
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

        <Text style={styles.headerTitle}>Budget Master</Text>

        <TouchableOpacity style={styles.bellBtn}>
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>

        {/* Dual metric card with cash stacks */}
        <BudgetDualCard
          remaining={remaining}
          onTrackProgress={displayOnTrackProgress}
          budget={budget}
        />

        {/* Deducting label */}
        {isAnimating && pendingTransaction && (
          <Animated.Text style={[styles.processingText, { opacity: processingOpacity }]}>
            Deducting ${pendingTransaction.amount.toFixed(2)}...
          </Animated.Text>
        )}

        {/* Mini cash stacks */}
        <View style={styles.cashArea}>
          <CashStack
            miniOnly
            onRef={(api) => (cashRef.current = api)}
          />
          <TimeframeProgressBar
            timeframe={timeframe}
            totalDays={totalDays}
            daysRemaining={daysRemaining}
            onTrackProgress={displayOnTrackProgress}
            previewDaysElapsed={previewDaysElapsed}
            onPreviewDaysElapsedChange={setPreviewDaysElapsed}
          />
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

  processingText: {
    textAlign: 'center',
    color: '#1a6fd4',
    fontSize: 15,
    fontWeight: '500',
    marginTop: 8,
  },

  cashArea: { paddingHorizontal: 0, paddingTop: 4, paddingBottom: 4 },

  /* ⭐ NEW ACTIVITY BOX ⭐ */
  activityContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },

    elevation: 4,
  },

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
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
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
