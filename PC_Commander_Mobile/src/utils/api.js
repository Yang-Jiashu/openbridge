import axios from 'axios';

/**
 * 测试服务器连接
 */
export const testConnection = async (serverUrl) => {
  try {
    const response = await axios.get(`${serverUrl}/api/health`, {
      timeout: 5000,
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 获取服务器配置
 */
export const getConfig = async (serverUrl) => {
  try {
    const response = await axios.get(`${serverUrl}/api/config`, {
      timeout: 5000,
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 发送聊天消息
 */
export const sendChatMessage = async (serverUrl, message) => {
  try {
    const response = await axios.post(
      `${serverUrl}/api/chat`,
      { message },
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};

/**
 * 执行命令
 */
export const executeCommand = async (serverUrl, command) => {
  try {
    const response = await axios.post(
      `${serverUrl}/api/execute`,
      { command },
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message,
    };
  }
};

/**
 * 获取服务器状态
 */
export const getServerStatus = async (serverUrl) => {
  try {
    const response = await axios.get(`${serverUrl}/api/status`, {
      timeout: 5000,
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
