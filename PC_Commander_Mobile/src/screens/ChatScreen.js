import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendChatMessage } from '../utils/api';

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'ai',
      content: '欢迎使用 PC Commander！\n\n我是你的 AI 助手，可以帮你：\n• 控制电脑执行命令\n• 管理文件和程序\n• 编写和运行代码\n\n请直接输入你的需求。',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const config = await AsyncStorage.getItem('serverConfig');
      const serverUrl = config ? JSON.parse(config).serverUrl : '';

      if (!serverUrl) {
        throw new Error('请先配置服务器地址');
      }

      const response = await sendChatMessage(serverUrl, userMessage.content);

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.response || '抱歉，处理失败',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `❌ 错误: ${error.message}\n\n请检查:\n1. 服务器是否启动\n2. 网络连接是否正常\n3. 服务器地址是否正确`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickCommands = [
    { icon: 'folder-open', label: '查看目录', command: 'ls -la' },
    { icon: 'information', label: '系统信息', command: 'systeminfo' },
    { icon: 'memory', label: '内存使用', command: 'tasklist' },
    { icon: 'harddisk', label: '磁盘空间', command: 'wmic logicaldisk get size,freespace,caption' },
  ];

  const renderMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.type === 'user' ? styles.userMessage : styles.aiMessage]}>
      <View style={[styles.avatar, item.type === 'user' ? styles.userAvatar : styles.aiAvatar]}>
        <Icon name={item.type === 'user' ? 'account' : 'robot'} size={20} color="#fff" />
      </View>
      <View style={[styles.messageBubble, item.type === 'user' ? styles.userBubble : styles.aiBubble]}>
        <Text style={styles.messageText}>{item.content}</Text>
        <Text style={styles.messageTime}>
          {new Date(item.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* 快捷命令 */}
      <View style={styles.quickCommands}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={quickCommands}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.quickCommandBtn}
              onPress={() => {
                setInputText(item.command);
              }}
            >
              <Icon name={item.icon} size={16} color="#0F2943" />
              <Text style={styles.quickCommandText}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 消息列表 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* 输入框 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="输入命令或消息..."
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <Icon name="loading" size={24} color="#fff" />
          ) : (
            <Icon name="send" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  quickCommands: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  quickCommandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  quickCommandText: {
    fontSize: 13,
    color: '#0F2943',
    marginLeft: 6,
    fontWeight: '500',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 80,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  userAvatar: {
    backgroundColor: '#10B981',
  },
  aiAvatar: {
    backgroundColor: '#0F2943',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#0F2943',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1F2937',
  },
  userBubbleText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    color: '#0F2943',
  },
  sendButton: {
    width: 48,
    height: 48,
    backgroundColor: '#0F2943',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
});
