import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useWatchStats } from '../contexts/WatchStatsContext';

type TabType = 'Total' | 'Year' | 'Month' | 'Day';

const WatchStatsScreen = () => {
  const [selectedTab, setSelectedTab] = useState<TabType>('Total');
  const { getStatsByPeriod } = useWatchStats();

  // Map tab to period
  const periodMap: { [key in TabType]: 'total' | 'year' | 'month' | 'day' } = {
    'Total': 'total',
    'Year': 'year',
    'Month': 'month',
    'Day': 'day',
  };

  const currentStats = getStatsByPeriod(periodMap[selectedTab]);

  // Convert category breakdown object to array and sort by count
  const categories: Array<{ label: string; value: number }> = Object.entries(currentStats.categoryBreakdown)
    .map(([label, value]) => ({ label, value: value as number }))
    .sort((a, b) => b.value - a.value);

  const tabs: TabType[] = ['Total', 'Year', 'Month', 'Day'];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile Page</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              selectedTab === tab && styles.tabActive,
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{currentStats.totalMinutesWatched}</Text>
          <Text style={styles.statLabel}>Minutes Watched</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{currentStats.totalShowsWatched}</Text>
          <Text style={styles.statLabel}># Shows Watched</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{currentStats.totalEpisodesWatched}</Text>
          <Text style={styles.statLabel}># Eps Watched</Text>
        </View>
      </View>

      {/* Category Breakdown */}
      <View style={styles.breakdownSection}>
        <Text style={styles.breakdownTitle}>Category Breakdown</Text>

        {categories.length > 0 ? (
          categories.map((category, index) => (
            <View key={index} style={styles.categoryRow}>
              <Text style={styles.categoryLabel}>{category.label}</Text>
              <View style={styles.categoryValue}>
                <Text style={styles.categoryNumber}>{category.value}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>
            No watch history yet. Start watching and logging your time!
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#D4E4FF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  statsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#D4E4FF',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  breakdownSection: {
    padding: 16,
    marginTop: 8,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#D4E4FF',
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  categoryValue: {
    backgroundColor: '#B8D4FF',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  categoryNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
});

export default WatchStatsScreen;