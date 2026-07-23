import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import BudgetDualCard from './BudgetDualCard';
import { useBudget, getBudgetMetrics, getOnTrackProgressForDaysRemaining } from '../context/BudgetContext';

export default function BudgetCarousel({ previewDaysElapsed, onPreviewDaysElapsedChange }) {
  const {
    budgets,
    activeBudgetIndex,
    setActiveBudgetIndex,
    updateBudgetById,
  } = useBudget();
  const { width } = useWindowDimensions();
  const listRef = useRef(null);

  useEffect(() => {
    if (budgets.length === 0) return;
    listRef.current?.scrollToIndex({
      index: activeBudgetIndex,
      animated: true,
    });
  }, [activeBudgetIndex, budgets.length]);

  const getDisplayOnTrack = (item, index) => {
    const { remaining, totalDays, daysRemaining, onTrackProgress } = getBudgetMetrics(item);
    if (index !== activeBudgetIndex || previewDaysElapsed === null) {
      return onTrackProgress;
    }
    const actualDaysElapsed = Math.max(0, totalDays - daysRemaining);
    const elapsed = previewDaysElapsed ?? actualDaysElapsed;
    const previewDaysRemaining = Math.max(0, totalDays - elapsed);
    return getOnTrackProgressForDaysRemaining(
      item.amount,
      remaining,
      totalDays,
      previewDaysRemaining,
    );
  };

  const handleScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    if (index !== activeBudgetIndex && index >= 0 && index < budgets.length) {
      setActiveBudgetIndex(index);
      onPreviewDaysElapsedChange?.(null);
    }
  };

  if (budgets.length === 0) return null;

  return (
    <View>
      <FlatList
        ref={listRef}
        data={budgets}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        bounces={budgets.length > 1}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={handleScrollEnd}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            listRef.current?.scrollToIndex({ index: info.index, animated: false });
          }, 100);
        }}
        renderItem={({ item, index }) => {
          const { remaining, onTrackProgress } = getBudgetMetrics(item);
          return (
            <View style={{ width }}>
              <BudgetDualCard
                budget={item.amount}
                remaining={remaining}
                onTrackProgress={getDisplayOnTrack(item, index)}
                budgetName={item.name}
                onUpdateBudget={(amount) => updateBudgetById(item.id, { amount })}
                onUpdateBudgetName={(name) => updateBudgetById(item.id, { name })}
                isActive={index === activeBudgetIndex}
              />
            </View>
          );
        }}
      />

      {budgets.length > 1 && (
        <View style={styles.dotsRow}>
          {budgets.map((b, i) => (
            <View
              key={b.id}
              style={[styles.dot, i === activeBudgetIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#d0d0d0',
  },
  dotActive: {
    backgroundColor: '#1a6fd4',
    width: 18,
  },
});
