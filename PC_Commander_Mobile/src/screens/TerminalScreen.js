import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { executeCommand } from '../utils/api';

export default function TerminalScreen() {
  const [logs, setLogs] = useState([
    { type: 'system', content: 'PC Commander Terminal v1.0.0' },
    { type: 'system', content: 'Type "help" for available commands' },
    { type: 'prompt', content: '' },
  ]);
  const [command, setCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const executeCmd = async () => {
    if (!command.trim() || isExecuting) return;

    const cmd = command.trim();
    setCommand('');
    
    // 添加用户输入到日志
    setLogs(prev => [...prev, { type: 'input', content: `➜ ${cmd}` }]);
    setIsExecuting(true);

    // 本地命令
    if (cmd === 'help') {
      setLogs(prev => [...prev, 
        { type: 'output', content: 'Available commands:\n  clear - Clear terminal\n  help - Show this help' },
        { type: 'prompt', content: '' }
      ]);
      setIsExecuting(false);
      return;
    }

    if (cmd === 'clear') {
      setLogs([
        { type: 'system', content: 'Terminal cleared' },
        { type: 'prompt', content: '' },
      ]);
      setIsExecuting(false);
      return;
    }

    // 远程执行命令
    try {
      const config = await AsyncStorage.getItem('serverConfig');
      const serverUrl = config ? JSON.parse(config).serverUrl : '';

      if (!serverUrl) {
        setLogs(prev => [...prev, 
          { type: 'error', content: 'Error: Server not configured. Please set up in Config.' },
          { type: 'prompt', content: '' }
        ]);
        setIsExecuting(false);
        return;
      }

      const result = await executeCommand(serverUrl, cmd);
      
      if (result.success) {
        setLogs(prev => [...prev, 
          { type: 'output', content: result.output || 'Command executed successfully' },
          { type: 'prompt', content: '' }
        ]);
      } else {
        setLogs(prev => [...prev, 
          { type: 'error', content: result.error || 'Command failed' },
          { type: 'prompt', content: '' }
        ]);
      }
    } catch (error) {
      setLogs(prev => [...prev, 
        { type: 'error', content: `Error: ${error.message}` },
        { type: 'prompt', content: '' }
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const renderLog = (log, index) => {
    switch (log.type) {
      case 'system':
        return <Text key={index} style={styles.systemText}>{log.content}</Text>;
      case 'input':
        return <Text key={index} style={styles.inputText}>{log.content}</Text>;
      case 'output':
        return <Text key={index} style={styles.outputText}>{log.content}</Text>;
      case 'error':
        return <Text key={index} style={styles.errorText}>{log.content}</Text>;
      case 'prompt':
        return (
          <View key={index} style={styles.promptLine}>
            <Text style={styles.promptText}>➜</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.terminal}>
        {logs.map((log, index) => renderLog(log, index))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <Text style={styles.promptIcon}>➜</Text>
        <TextInput
          style={styles.input}
          value={command}
          onChangeText={setCommand}
          placeholder="Enter command..."
          placeholderTextColor="#6B7280"
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={executeCmd}
          editable={!isExecuting}
        />
        <TouchableOpacity
          style={[styles.executeButton, isExecuting && styles.executeButtonDisabled]}
          onPress={executeCmd}
          disabled={isExecuting}
        >
          <Icon name={isExecuting ? 'loading' : 'play'} size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 快捷命令栏 */}
      <View style={styles.quickBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['ls', 'pwd', 'clear', 'help'].map((cmd) => (
            <TouchableOpacity
              key={cmd}
              style={styles.quickBtn}
              onPress={() => {
                setCommand(cmd);
              }}
            >
              <Text style={styles.quickBtnText}>{cmd}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  terminal: {
    flex: 1,
    padding: 16,
  },
  systemText: {
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  inputText: {
    color: '#00D4FF',
    fontSize: 14,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  outputText: {
    color: '#E5E7EB',
    fontSize: 14,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  promptLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promptText: {
    color: '#00D4FF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: '#2D3748',
  },
  promptIcon: {
    color: '#00D4FF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    paddingVertical: 8,
  },
  executeButton: {
    width: 40,
    height: 40,
    backgroundColor: '#10B981',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  executeButtonDisabled: {
    backgroundColor: '#374151',
  },
  quickBar: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#2D3748',
  },
  quickBtn: {
    backgroundColor: '#2D3748',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  quickBtnText: {
    color: '#E5E7EB',
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
