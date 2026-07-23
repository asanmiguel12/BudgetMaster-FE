import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { formatTimeframe, useBudget } from '../context/BudgetContext';
import EditPencil from './EditPencil';
import { EditTimeframeModal } from './BudgetEditModals';

const GOLD_THRESHOLD = 75;
const FAIR_THRESHOLD = 50;

function getOnTrackStatus(progress) {
  if (progress >= GOLD_THRESHOLD) {
    return { label: 'Budget Master!', color: '#2a8a2a' };
  }
  if (progress >= FAIR_THRESHOLD) {
    return { label: 'Still On Track!', color: '#d4a017' };
  }
  return { label: 'Budget Better!', color: '#e53e3e' };
}

export default function TimeframeProgressBar({
  timeframe,
  totalDays,
  daysRemaining,
  onTrackProgress,
  previewDaysElapsed,
  onPreviewDaysElapsedChange,
  isActive = true,
  onUpdateTimeframe: onUpdateTimeframeProp,
}) {
  const { updateTimeframe: contextUpdateTimeframe } = useBudget();
  const updateTimeframe = onUpdateTimeframeProp ?? contextUpdateTimeframe;
  const [timeframeEditVisible, setTimeframeEditVisible] = useState(false);
  const timeframeLabel = formatTimeframe(timeframe) || 'Budget period';
  const actualDaysElapsed = Math.max(0, totalDays - daysRemaining);
  const isPreview = previewDaysElapsed !== null && previewDaysElapsed !== actualDaysElapsed;

  const displayDaysElapsed = previewDaysElapsed ?? actualDaysElapsed;
  const displayDaysRemaining = Math.max(0, totalDays - displayDaysElapsed);

  const [sliderValue, setSliderValue] = useState(actualDaysElapsed);

  useEffect(() => {
    if (previewDaysElapsed === null) {
      setSliderValue(actualDaysElapsed);
    }
  }, [actualDaysElapsed, previewDaysElapsed]);

  const status = getOnTrackStatus(onTrackProgress);
  const onTrackLabel = `${Math.round(onTrackProgress)}%`;

  const daysLeftLabel = displayDaysRemaining === 1
    ? '1 day left'
    : `${displayDaysRemaining} days left`;

  const elapsedLabel = totalDays > 0
    ? `Day ${displayDaysElapsed} of ${totalDays}`
    : 'Starting period';

  const handleSliderChange = (value) => {
    if (!isActive) return;
    const rounded = Math.round(value);
    setSliderValue(rounded);
    onPreviewDaysElapsedChange?.(rounded === actualDaysElapsed ? null : rounded);
  };

  const handleReset = () => {
    if (!isActive) return;
    setSliderValue(actualDaysElapsed);
    onPreviewDaysElapsedChange?.(null);
  };

  useEffect(() => {
    if (isActive) {
      onPreviewDaysElapsedChange?.(null);
    }
  }, [totalDays, isActive, onPreviewDaysElapsedChange]);

  const handleTimeframeSave = async (newTimeframe) => {
    await updateTimeframe(newTimeframe);
    onPreviewDaysElapsedChange?.(null);
  };

  const openTimeframeEdit = () => {
    if (isActive) setTimeframeEditVisible(true);
  };

  if (totalDays <= 0) {
    return (
      <>
        <TouchableOpacity
          style={styles.container}
          onPress={openTimeframeEdit}
          activeOpacity={isActive ? 0.7 : 1}
          disabled={!isActive}
        >
          <Text style={[styles.timeframeLabel, isActive && styles.timeframeLabelTappable]}>
            Set budget timeframe to track progress
          </Text>
        </TouchableOpacity>

        <EditTimeframeModal
          visible={timeframeEditVisible}
          initialTimeframe={timeframe}
          onSave={handleTimeframeSave}
          onClose={() => setTimeframeEditVisible(false)}
        />
      </>
    );
  }

  return (
    <>
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.timeframeRow}
          onPress={openTimeframeEdit}
          activeOpacity={isActive ? 0.7 : 1}
          disabled={!isActive}
        >
          <Text style={[styles.timeframeLabel, isActive && styles.timeframeLabelTappable]}>
            {timeframeLabel}
          </Text>
          {isActive && <EditPencil onPress={openTimeframeEdit} size={10} />}
        </TouchableOpacity>
        <Text style={styles.daysLeft}>{daysLeftLabel}</Text>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={totalDays}
        step={1}
        value={sliderValue}
        onValueChange={handleSliderChange}
        minimumTrackTintColor="#1a6fd4"
        maximumTrackTintColor="#e8e8e8"
        thumbTintColor="#1a6fd4"
        disabled={!isActive}
      />

      <View style={styles.footerRow}>
        <Text style={styles.elapsed}>{elapsedLabel}</Text>
        <Text style={[styles.onTrackPercent, { color: status.color }]}>{onTrackLabel}</Text>
      </View>

      <View style={styles.statusRow}>
        {isPreview ? (
          <TouchableOpacity onPress={handleReset} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.previewHint}>Preview · tap to reset</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.dragHint}>Drag to preview on-track progress</Text>
        )}
        {status.lines ? (
          <View style={styles.stackedStatus}>
            {status.lines.map((line) => (
              <Text key={line} style={[styles.status, { color: status.color }]}>{line}</Text>
            ))}
          </View>
        ) : (
          <Text style={[styles.status, { color: status.color }]}>{status.label}</Text>
        )}
      </View>
    </View>

    <EditTimeframeModal
      visible={timeframeEditVisible}
      initialTimeframe={timeframe}
      onSave={handleTimeframeSave}
      onClose={() => setTimeframeEditVisible(false)}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
    padding: 14,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  timeframeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },

  timeframeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },

  timeframeLabelTappable: {
    color: '#1a6fd4',
  },

  daysLeft: {
    fontSize: 13,
    color: '#666',
  },

  slider: {
    width: '100%',
    height: 36,
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },

  elapsed: {
    fontSize: 12,
    color: '#888',
  },

  onTrackPercent: {
    fontSize: 16,
    fontWeight: '800',
  },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },

  dragHint: {
    fontSize: 11,
    color: '#aaa',
    flex: 1,
  },

  previewHint: {
    fontSize: 11,
    color: '#1a6fd4',
    fontWeight: '600',
    flex: 1,
  },

  status: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },

  stackedStatus: {
    alignItems: 'flex-end',
  },
});
