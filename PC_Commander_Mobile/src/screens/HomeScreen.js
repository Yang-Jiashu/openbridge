import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { testConnection } from '../utils/api';

export default function HomeScreen({ navigation }) {
  const [serverUrl, setServerUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState({
    commands: 0,
    uptime: '0m',
    status: '离线'
  });

  useEffect(() => {
    loadConfig();
    checkConnection();
  }, []);

  const loadConfig = async () => {
    try {
      const config = await AsyncStorage.getItem('serverConfig');
      if (config) {
        const parsed = JSON.parse(config);
        setServerUrl(parsed.serverUrl || '');
      }
    } catch (e) {
      console.error('加载配置失败:', e);
    }
  };

  const checkConnection = async () => {
    try {
      const config = await AsyncStorage.getItem('serverConfig');
      if (config) {
        const parsed = JSON.parse(config);
        const result = await testConnection(parsed.serverUrl);
        setIsConnected(result.success);
        setStats({
          commands: 128,
          uptime: '2h 15m',
          status: result.success ? '在线' : '离线'
        });
      }
    } catch (e) {
      setIsConnected(false);
    }
  };

  const quickActions = [
    { icon: 'chat', label: 'AI 助手', screen: 'Chat', color: '#00D4FF' },
    { icon: 'console', label: '终端', screen: 'Terminal', color: '#10B981' },
    { icon: 'file-document', label: '文件', screen: 'Files', color: '#F59E0B' },
    { icon: 'cog', label: '配置', screen: 'Config', color: '#8B5CF6' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F2943" />
      
      {/* 状态卡片 */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.statusIndicator}>
            <View style={[styles.dot, isConnected ? styles.dotOnline : styles.dotOffline]} />
            <Text style={styles.statusText}>{stats.status}</Text>
          </View>
          <TouchableOpacity onPress={checkConnection}>
            <Icon name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.commands}</Text>
            <Text style={styles.statLabel}>命令数</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.uptime}</Text>
            <Text style={styles.statLabel}>运行时间</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{isConnected ? '45ms' : '--'}</Text>
            <Text style={styles.statLabel}>延迟</Text>
          </View>
        </View>
        
        {serverUrl && (
          <Text style={styles.serverUrl}>{serverUrl}</Text>
        )}
      </View>

      {/* 快速操作 */}
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>快速操作</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen)}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${action.color}20` }]}>
                <Icon name={action.icon} size={32} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 最近活动 */}
        <Text style={styles.sectionTitle}>最近活动</Text>
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <Icon name="check-circle" size={20} color="#10B981" />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>服务器连接成功</Text>
              <Text style={styles.activityTime}>2分钟前</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <Icon name="terminal" size={20} color="#00D4FF" />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>执行命令: ls -la</Text>
              <Text style={styles.activityTime}>5分钟前</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  statusCard: {
    backgroundColor: '#0F2943',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  dotOnline: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  dotOffline: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 4,
  },
  serverUrl: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F2943',
    marginBottom: 16,
    marginTop: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 24,
  },
  actionCard: {
    width: '50%',
    padding: 8,
  },
  iconContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#0F2943',
  },
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityContent: {
    marginLeft: 12,
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F2943',
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
