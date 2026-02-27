import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { testConnection } from '../utils/api';

export default function ConfigScreen() {
  const [config, setConfig] = useState({
    serverUrl: '',
    openCodeUrl: 'http://localhost:12345',
    openClawUrl: 'ws://localhost:18789',
    language: 'zh-CN',
    theme: 'light',
  });
  const [isTesting, setIsTesting] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const saved = await AsyncStorage.getItem('serverConfig');
      if (saved) {
        setConfig(JSON.parse(saved));
      }
    } catch (e) {
      console.error('加载配置失败:', e);
    }
  };

  const saveConfig = async () => {
    try {
      await AsyncStorage.setItem('serverConfig', JSON.stringify(config));
      addLog('配置已保存', 'success');
      Toast.show({
        type: 'success',
        text1: '保存成功',
        text2: '配置已更新',
      });
    } catch (e) {
      addLog('保存失败: ' + e.message, 'error');
      Toast.show({
        type: 'error',
        text1: '保存失败',
        text2: e.message,
      });
    }
  };

  const handleTestConnection = async () => {
    if (!config.serverUrl) {
      Toast.show({
        type: 'error',
        text1: '错误',
        text2: '请输入服务器地址',
      });
      return;
    }

    setIsTesting(true);
    addLog(`正在测试连接: ${config.serverUrl}`, 'info');

    try {
      const startTime = Date.now();
      const result = await testConnection(config.serverUrl);
      const duration = Date.now() - startTime;

      if (result.success) {
        addLog(`连接成功! 延迟: ${duration}ms`, 'success');
        Toast.show({
          type: 'success',
          text1: '连接成功',
          text2: `延迟: ${duration}ms`,
        });
      } else {
        addLog(`连接失败: ${result.error}`, 'error');
        Toast.show({
          type: 'error',
          text1: '连接失败',
          text2: result.error,
        });
      }
    } catch (e) {
      addLog(`测试异常: ${e.message}`, 'error');
      Toast.show({
        type: 'error',
        text1: '测试失败',
        text2: e.message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('zh-CN');
    setLogs(prev => [{ timestamp, message, type }, ...prev].slice(0, 50));
  };

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>服务器配置</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>服务器地址</Text>
          <TextInput
            style={styles.input}
            value={config.serverUrl}
            onChangeText={(text) => updateConfig('serverUrl', text)}
            placeholder="http://192.168.1.5:8000"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
          />
          <Text style={styles.hint}>请输入 PC 服务器的 IP 地址和端口</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>OpenCode 地址</Text>
          <TextInput
            style={styles.input}
            value={config.openCodeUrl}
            onChangeText={(text) => updateConfig('openCodeUrl', text)}
            placeholder="http://localhost:12345"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>OpenClaw 地址</Text>
          <TextInput
            style={styles.input}
            value={config.openClawUrl}
            onChangeText={(text) => updateConfig('openClawUrl', text)}
            placeholder="ws://localhost:18789"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>应用设置</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>语言</Text>
          <View style={styles.languageSelector}>
            <TouchableOpacity
              style={[styles.langBtn, config.language === 'zh-CN' && styles.langBtnActive]}
              onPress={() => updateConfig('language', 'zh-CN')}
            >
              <Text style={[styles.langText, config.language === 'zh-CN' && styles.langTextActive]}>中文</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langBtn, config.language === 'en-US' && styles.langBtnActive]}
              onPress={() => updateConfig('language', 'en-US')}
            >
              <Text style={[styles.langText, config.language === 'en-US' && styles.langTextActive]}>English</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 操作按钮 */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, styles.testButton, isTesting && styles.buttonDisabled]}
          onPress={handleTestConnection}
          disabled={isTesting}
        >
          <Icon name="connection" size={20} color="#fff" />
          <Text style={styles.buttonText}>
            {isTesting ? '测试中...' : '测试连接'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={saveConfig}
        >
          <Icon name="content-save" size={20} color="#fff" />
          <Text style={styles.buttonText}>保存配置</Text>
        </TouchableOpacity>
      </View>

      {/* API 日志 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API 日志</Text>
        <View style={styles.logContainer}>
          {logs.length === 0 ? (
            <Text style={styles.emptyLog}>暂无日志</Text>
          ) : (
            logs.map((log, index) => (
              <View key={index} style={styles.logItem}>
                <Text style={styles.logTime}>{log.timestamp}</Text>
                <Text style={[styles.logMessage, styles[`log${log.type}`]]}>
                  {log.message}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F2943',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0F2943',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#374151',
  },
  languageSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  langBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  langBtnActive: {
    backgroundColor: '#0F2943',
  },
  langText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  langTextActive: {
    color: '#fff',
  },
  buttonGroup: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  testButton: {
    backgroundColor: '#00D4FF',
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    maxHeight: 200,
  },
  emptyLog: {
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  logItem: {
    marginBottom: 8,
  },
  logTime: {
    color: '#6B7280',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  logMessage: {
    fontSize: 13,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  loginfo: {
    color: '#00D4FF',
  },
  logsuccess: {
    color: '#10B981',
  },
  logerror: {
    color: '#EF4444',
  },
});
