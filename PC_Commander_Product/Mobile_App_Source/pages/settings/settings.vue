<template>
	<view class="container">
		<!-- 科技感背景 -->
		<view class="cyber-bg">
			<view class="cyber-grid"></view>
			<view class="cyber-glow g1"></view>
			<view class="cyber-glow g2"></view>
		</view>

		<!-- 导航栏 -->
		<view class="nav-bar">
			<view class="nav-content">
				<view class="back-btn" @click="goBack">
					<text class="arrow">←</text>
				</view>
				<text class="nav-title">⚙️ 系统设置</text>
				<view class="nav-placeholder"></view>
			</view>
		</view>

		<scroll-view class="content" scroll-y>
			<!-- 服务器状态卡片 -->
			<view class="status-card" :class="connectionStatus">
				<view class="status-icon">
					<text>{{ connectionStatus === 'connected' ? '✓' : connectionStatus === 'error' ? '✕' : '?' }}</text>
				</view>
				<view class="status-info">
					<text class="status-title">{{ connectionStatus === 'connected' ? '已连接' : connectionStatus === 'error' ? '连接失败' : '未测试' }}</text>
					<text class="status-desc">{{ serverUrl || '请配置服务器地址' }}</text>
				</view>
				<view class="status-pulse" v-if="connectionStatus === 'connected'"></view>
			</view>

			<!-- 服务器配置 -->
			<view class="config-section">
				<view class="section-header">
					<view class="section-icon">🌐</view>
					<text class="section-title">服务器配置</text>
				</view>

				<view class="input-group">
					<text class="input-label">服务器地址</text>
					<view class="input-wrapper">
						<text class="input-prefix">🔗</text>
						<input 
							class="config-input"
							v-model="serverUrl"
							placeholder="http://192.168.1.5:8000"
							placeholder-class="input-placeholder"
						/>
					</view>
					<text class="input-hint">输入电脑 IP 地址，确保手机和电脑在同一 WiFi</text>
				</view>

				<view class="button-group">
					<button class="cyber-btn secondary" @click="testConnection" :disabled="testing">
						<text v-if="!testing">🔌 测试连接</text>
						<view v-else class="btn-spinner"></view>
					</button>
					<button class="cyber-btn primary" @click="saveSettings">
						<text>💾 保存设置</text>
					</button>
				</view>
			</view>

			<!-- 功能开关 -->
			<view class="config-section">
				<view class="section-header">
					<view class="section-icon">🔧</view>
					<text class="section-title">功能设置</text>
				</view>

				<view class="toggle-list">
					<view class="toggle-item">
						<view class="toggle-info">
							<text class="toggle-title">自动保存代码</text>
							<text class="toggle-desc">编辑代码时自动保存</text>
						</view>
						<switch :checked="autoSave" @change="autoSave = $event.detail.value" color="#00d4ff" />
					</view>

					<view class="toggle-item">
						<view class="toggle-info">
							<text class="toggle-title">深色模式</text>
							<text class="toggle-desc">始终使用深色主题</text>
						</view>
						<switch :checked="darkMode" @change="darkMode = $event.detail.value" color="#00d4ff" />
					</view>

					<view class="toggle-item">
						<view class="toggle-info">
							<text class="toggle-title">消息通知</text>
							<text class="toggle-desc">接收执行完成通知</text>
						</view>
						<switch :checked="notifications" @change="notifications = $event.detail.value" color="#00d4ff" />
					</view>
				</view>
			</view>

			<!-- 数据管理 -->
			<view class="config-section">
				<view class="section-header">
					<view class="section-icon">💾</view>
					<text class="section-title">数据管理</text>
				</view>

				<view class="data-actions">
					<view class="data-btn" @click="clearChatHistory">
						<text class="data-icon">🗑️</text>
						<view class="data-info">
							<text class="data-title">清除聊天记录</text>
							<text class="data-desc">删除所有对话历史</text>
						</view>
						<text class="data-arrow">›</text>
					</view>

					<view class="data-btn" @click="clearCache">
						<text class="data-icon">🧹</text>
						<view class="data-info">
							<text class="data-title">清除缓存</text>
							<text class="data-desc">释放存储空间</text>
						</view>
						<text class="data-arrow">›</text>
					</view>

					<view class="data-btn" @click="exportData">
						<text class="data-icon">📤</text>
						<view class="data-info">
							<text class="data-title">导出数据</text>
							<text class="data-desc">备份设置和记录</text>
						</view>
						<text class="data-arrow">›</text>
					</view>
				</view>
			</view>

			<!-- 关于 -->
			<view class="config-section">
				<view class="section-header">
					<view class="section-icon">ℹ️</view>
					<text class="section-title">关于</text>
				</view>

				<view class="about-content">
					<view class="about-logo">
						<text class="logo-icon">🖥️</text>
					</view>
					<text class="about-name">OpenCode Remote</text>
					<text class="about-version">v1.0.0</text>
					<text class="about-desc">通过手机远程控制电脑，集成 OpenCode 和 OpenClaw 的 AI 编程助手</text>
					
					<view class="tech-stack">
						<text class="tech-tag">OpenCode</text>
						<text class="tech-tag">OpenClaw</text>
						<text class="tech-tag">Node.js</text>
						<text class="tech-tag">Uni-app</text>
					</view>
				</view>
			</view>

			<view class="footer-space"></view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			serverUrl: '',
			connectionStatus: 'unknown',
			testing: false,
			autoSave: true,
			darkMode: true,
			notifications: true
		}
	},
	onLoad() {
		this.loadSettings();
	},
	methods: {
		loadSettings() {
			const saved = uni.getStorageSync('server_url');
			if (saved) {
				this.serverUrl = saved;
				this.testConnection();
			}
			
			this.autoSave = uni.getStorageSync('auto_save') !== false;
			this.darkMode = uni.getStorageSync('dark_mode') !== false;
			this.notifications = uni.getStorageSync('notifications') !== false;
		},
		async testConnection() {
			if (!this.serverUrl.trim()) {
				uni.showToast({ title: '请输入服务器地址', icon: 'none' });
				return;
			}

			this.testing = true;
			this.connectionStatus = 'unknown';

			try {
				const res = await uni.request({
					url: `${this.serverUrl}/api/health`,
					method: 'GET',
					timeout: 5000
				});

				if (res.statusCode === 200) {
					this.connectionStatus = 'connected';
					uni.showToast({ title: '连接成功', icon: 'success' });
				} else {
					this.connectionStatus = 'error';
					uni.showToast({ title: '连接失败', icon: 'none' });
				}
			} catch (e) {
				this.connectionStatus = 'error';
				uni.showToast({ title: '无法连接到服务器', icon: 'none' });
			} finally {
				this.testing = false;
			}
		},
		saveSettings() {
			let url = this.serverUrl.trim();
			if (!url) {
				uni.showToast({ title: '请输入服务器地址', icon: 'none' });
				return;
			}

			// 格式化 URL
			if (!url.startsWith('http')) url = 'http://' + url;
			if (url.endsWith('/')) url = url.slice(0, -1);

			uni.setStorageSync('server_url', url);
			uni.setStorageSync('auto_save', this.autoSave);
			uni.setStorageSync('dark_mode', this.darkMode);
			uni.setStorageSync('notifications', this.notifications);

			uni.showToast({ title: '保存成功', icon: 'success' });
			
			setTimeout(() => {
				uni.navigateBack();
			}, 1000);
		},
		clearChatHistory() {
			uni.showModal({
				title: '清除聊天记录',
				content: '确定要清除所有聊天记录吗？此操作不可恢复。',
				confirmColor: '#ef4444',
				success: (res) => {
					if (res.confirm) {
						uni.removeStorageSync('chat_history');
						uni.showToast({ title: '已清除', icon: 'success' });
					}
				}
			});
		},
		clearCache() {
			uni.showModal({
				title: '清除缓存',
				content: '确定要清除所有缓存数据吗？',
				confirmColor: '#ef4444',
				success: (res) => {
					if (res.confirm) {
						uni.clearStorageSync();
						uni.showToast({ title: '已清除', icon: 'success' });
						this.loadSettings();
					}
				}
			});
		},
		exportData() {
			uni.showToast({ title: '导出功能开发中', icon: 'none' });
		},
		goBack() {
			uni.navigateBack();
		}
	}
}
</script>

<style>
.container {
	min-height: 100vh;
	background: #0a0a0f;
	position: relative;
}

/* 背景 */
.cyber-bg {
	position: fixed;
	inset: 0;
	z-index: 0;
	overflow: hidden;
}

.cyber-grid {
	position: absolute;
	inset: 0;
	background-image: 
		linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
		linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
	background-size: 60px 60px;
}

.cyber-glow {
	position: absolute;
	border-radius: 50%;
	filter: blur(100px);
	opacity: 0.2;
}

.g1 {
	width: 300px;
	height: 300px;
	background: linear-gradient(135deg, #00d4ff, #7c3aed);
	top: 10%;
	right: -100px;
}

.g2 {
	width: 250px;
	height: 250px;
	background: linear-gradient(135deg, #7c3aed, #00d4ff);
	bottom: 20%;
	left: -80px;
}

/* 导航栏 */
.nav-bar {
	position: sticky;
	top: 0;
	z-index: 100;
	background: rgba(10, 10, 15, 0.9);
	backdrop-filter: blur(20px);
	border-bottom: 1px solid rgba(0, 212, 255, 0.1);
	padding-top: var(--status-bar-height);
}

.nav-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 14px 16px;
}

.back-btn {
	width: 36px;
	height: 36px;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(0, 212, 255, 0.2);
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-btn .arrow {
	color: #fff;
	font-size: 18px;
}

.nav-title {
	color: #fff;
	font-size: 17px;
	font-weight: 600;
}

.nav-placeholder {
	width: 36px;
}

/* 内容 */
.content {
	padding: 16px;
	height: calc(100vh - 70px - var(--status-bar-height));
}

/* 状态卡片 */
.status-card {
	position: relative;
	background: rgba(255, 255, 255, 0.03);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 16px;
	padding: 20px;
	display: flex;
	align-items: center;
	gap: 16px;
	margin-bottom: 16px;
	overflow: hidden;
}

.status-card.connected {
	border-color: rgba(16, 185, 129, 0.3);
	background: rgba(16, 185, 129, 0.05);
}

.status-card.error {
	border-color: rgba(239, 68, 68, 0.3);
	background: rgba(239, 68, 68, 0.05);
}

.status-icon {
	width: 48px;
	height: 48px;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 14px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24px;
}

.status-card.connected .status-icon {
	background: rgba(16, 185, 129, 0.2);
}

.status-card.error .status-icon {
	background: rgba(239, 68, 68, 0.2);
}

.status-info {
	flex: 1;
}

.status-title {
	color: #fff;
	font-size: 16px;
	font-weight: 600;
	display: block;
}

.status-desc {
	color: rgba(255, 255, 255, 0.5);
	font-size: 12px;
	margin-top: 4px;
	display: block;
}

.status-pulse {
	position: absolute;
	top: 16px;
	right: 16px;
	width: 8px;
	height: 8px;
	background: #10b981;
	border-radius: 50%;
	box-shadow: 0 0 10px #10b981;
	animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
	0%, 100% { opacity: 1; transform: scale(1); }
	50% { opacity: 0.5; transform: scale(1.2); }
}

/* 配置区域 */
.config-section {
	background: rgba(255, 255, 255, 0.03);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 16px;
	padding: 20px;
	margin-bottom: 16px;
}

.section-header {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 16px;
}

.section-icon {
	font-size: 20px;
}

.section-title {
	color: #fff;
	font-size: 15px;
	font-weight: 600;
}

/* 输入组 */
.input-group {
	margin-bottom: 16px;
}

.input-label {
	color: rgba(255, 255, 255, 0.7);
	font-size: 13px;
	margin-bottom: 8px;
	display: block;
}

.input-wrapper {
	position: relative;
	display: flex;
	align-items: center;
}

.input-prefix {
	position: absolute;
	left: 14px;
	font-size: 16px;
	z-index: 1;
}

.config-input {
	flex: 1;
	height: 48px;
	background: rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(0, 212, 255, 0.2);
	border-radius: 12px;
	padding: 0 16px 0 42px;
	color: #fff;
	font-size: 14px;
}

.config-input:focus {
	border-color: rgba(0, 212, 255, 0.5);
}

.input-placeholder {
	color: rgba(255, 255, 255, 0.3);
}

.input-hint {
	color: rgba(255, 255, 255, 0.4);
	font-size: 11px;
	margin-top: 8px;
	display: block;
}

/* 按钮组 */
.button-group {
	display: flex;
	gap: 10px;
}

.cyber-btn {
	flex: 1;
	height: 44px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	transition: all 0.3s ease;
}

.cyber-btn.primary {
	background: linear-gradient(135deg, #00d4ff, #7c3aed);
}

.cyber-btn.secondary {
	background: rgba(255, 255, 255, 0.08);
	border: 1px solid rgba(0, 212, 255, 0.2);
}

.cyber-btn text {
	color: #fff;
	font-size: 14px;
}

.cyber-btn[disabled] {
	opacity: 0.6;
}

.btn-spinner {
	width: 18px;
	height: 18px;
	border: 2px solid rgba(255, 255, 255, 0.3);
	border-top-color: #00d4ff;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

/* 开关列表 */
.toggle-list {
	margin-top: 8px;
}

.toggle-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 14px 0;
	border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.toggle-item:last-child {
	border-bottom: none;
}

.toggle-info {
	flex: 1;
}

.toggle-title {
	color: #fff;
	font-size: 14px;
	display: block;
}

.toggle-desc {
	color: rgba(255, 255, 255, 0.4);
	font-size: 12px;
	margin-top: 2px;
	display: block;
}

/* 数据操作 */
.data-actions {
	margin-top: 8px;
}

.data-btn {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 14px 0;
	border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	transition: opacity 0.3s ease;
}

.data-btn:active {
	opacity: 0.7;
}

.data-btn:last-child {
	border-bottom: none;
}

.data-icon {
	font-size: 22px;
}

.data-info {
	flex: 1;
}

.data-title {
	color: #fff;
	font-size: 14px;
	display: block;
}

.data-desc {
	color: rgba(255, 255, 255, 0.4);
	font-size: 12px;
	margin-top: 2px;
	display: block;
}

.data-arrow {
	color: rgba(255, 255, 255, 0.3);
	font-size: 18px;
}

/* 关于 */
.about-content {
	text-align: center;
	padding: 20px 0;
}

.about-logo {
	width: 80px;
	height: 80px;
	background: linear-gradient(135deg, #00d4ff, #7c3aed);
	border-radius: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 auto 16px;
	box-shadow: 0 10px 40px rgba(0, 212, 255, 0.3);
}

.logo-icon {
	font-size: 40px;
}

.about-name {
	color: #fff;
	font-size: 18px;
	font-weight: 700;
	display: block;
}

.about-version {
	color: rgba(255, 255, 255, 0.5);
	font-size: 13px;
	margin-top: 4px;
	display: block;
}

.about-desc {
	color: rgba(255, 255, 255, 0.6);
	font-size: 13px;
	line-height: 1.6;
	margin-top: 12px;
	padding: 0 20px;
	display: block;
}

.tech-stack {
	display: flex;
	justify-content: center;
	gap: 8px;
	margin-top: 16px;
	flex-wrap: wrap;
}

.tech-tag {
	background: rgba(0, 212, 255, 0.1);
	border: 1px solid rgba(0, 212, 255, 0.2);
	border-radius: 20px;
	padding: 4px 12px;
	color: #00d4ff;
	font-size: 11px;
}

.footer-space {
	height: 40px;
}
</style>
