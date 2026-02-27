<template>
	<view class="container">
		<!-- 动态科技背景 -->
		<view class="tech-bg">
			<view class="grid-lines"></view>
			<view class="glow-orb orb-1"></view>
			<view class="glow-orb orb-2"></view>
			<view class="particles">
				<view v-for="i in 20" :key="i" class="particle" :style="particleStyle(i)"></view>
			</view>
		</view>

		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-content">
				<view class="brand">
					<view class="logo-pulse">
						<view class="logo-ring r1"></view>
						<view class="logo-ring r2"></view>
						<view class="logo-core">🖥️</view>
					</view>
					<view class="brand-text">
						<text class="app-name">OpenCode<span class="highlight">Remote</span></text>
						<view class="connection-badge" :class="connectionStatus">
							<view class="pulse-dot"></view>
							<text>{{ connectionText }}</text>
						</view>
					</view>
				</view>
			<view class="nav-actions">
				<view class="icon-btn" @click="showTerminal = true">
					<text class="icon">📟</text>
				</view>
				<view class="icon-btn" @click="goToApiConfig">
					<text class="icon">🔌</text>
				</view>
				<view class="icon-btn" @click="goToSettings">
					<text class="icon">⚙️</text>
				</view>
			</view>
			</view>
		</view>

		<!-- 功能标签页 -->
		<view class="tab-bar">
			<view 
				v-for="tab in tabs" 
				:key="tab.id"
				class="tab-item"
				:class="{ active: currentTab === tab.id }"
				@click="currentTab = tab.id"
			>
				<text class="tab-icon">{{ tab.icon }}</text>
				<text class="tab-text">{{ tab.name }}</text>
				<view v-if="currentTab === tab.id" class="tab-indicator"></view>
			</view>
		</view>

		<!-- 主内容区 -->
		<swiper class="content-swiper" :current="currentTabIndex" @change="onSwiperChange">
			<!-- Tab 1: AI 助手 -->
			<swiper-item>
				<scroll-view scroll-y class="tab-content">
					<!-- 快捷指令面板 -->
					<view class="quick-panel">
						<text class="panel-title">⚡ 快速操作</text>
						<view class="quick-grid">
							<view 
								v-for="(cmd, idx) in quickCommands" 
								:key="idx"
								class="quick-btn"
								:style="{ '--delay': idx * 0.1 + 's' }"
								@click="executeCommand(cmd)"
							>
								<view class="quick-glow" :style="{ background: cmd.color }"></view>
								<text class="quick-icon">{{ cmd.icon }}</text>
								<text class="quick-label">{{ cmd.label }}</text>
							</view>
						</view>
					</view>

					<!-- 聊天区域 -->
					<view class="chat-container">
						<view 
							v-for="(msg, idx) in messages" 
							:key="idx"
							class="message-item"
							:class="[msg.type, { 'new': idx === messages.length - 1 }]"
						>
							<view class="msg-avatar" :style="{ background: msg.type === 'ai' ? 'linear-gradient(135deg, #00d4ff, #7c3aed)' : 'linear-gradient(135deg, #10b981, #3b82f6)' }">
								<text>{{ msg.type === 'ai' ? '🤖' : '👤' }}</text>
							</view>
							<view class="msg-content">
								<view class="msg-bubble" :class="msg.type">
									<text class="msg-text">{{ msg.content }}</text>
								</view>
								<text class="msg-time">{{ msg.time }}</text>
							</view>
						</view>

						<!-- AI 思考中 -->
						<view v-if="isThinking" class="message-item ai thinking">
							<view class="msg-avatar" style="background: linear-gradient(135deg, #00d4ff, #7c3aed);">
								<text>🤖</text>
							</view>
							<view class="msg-content">
								<view class="msg-bubble ai">
									<view class="thinking-dots">
										<text v-for="i in 3" :key="i" class="dot" :style="{ animationDelay: (i-1)*0.2 + 's' }">●</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</swiper-item>

			<!-- Tab 2: 代码编辑器 -->
			<swiper-item>
				<view class="tab-content code-tab">
					<view class="editor-header">
						<text class="editor-title">📝 代码编辑器</text>
						<view class="editor-actions">
							<text class="action" @click="runCode">▶️ 运行</text>
							<text class="action" @click="saveCode">💾 保存</text>
						</view>
					</view>
					<textarea 
						class="code-editor" 
						v-model="codeContent"
						placeholder="// 在这里输入代码...
// 支持 JavaScript、Python、Shell 等"
					/>
				</view>
			</swiper-item>

			<!-- Tab 3: 文件管理 -->
			<swiper-item>
				<scroll-view scroll-y class="tab-content">
					<view class="file-toolbar">
						<text class="toolbar-title">📂 文件管理</text>
						<text class="refresh-btn" @click="refreshFiles">🔄</text>
					</view>
					<view class="file-list">
						<view 
							v-for="file in files" 
							:key="file.name"
							class="file-item"
							@click="openFile(file)"
						>
							<text class="file-icon">{{ file.type === 'folder' ? '📁' : '📄' }}</text>
							<view class="file-info">
								<text class="file-name">{{ file.name }}</text>
								<text class="file-meta">{{ file.size }} • {{ file.modified }}</text>
							</view>
							<text class="file-action">›</text>
						</view>
					</view>
				</scroll-view>
			</swiper-item>
		</swiper>

		<!-- 底部输入区 -->
		<view class="input-bar">
			<view class="input-wrapper">
				<input 
					class="command-input"
					v-model="inputText"
					placeholder="输入命令或消息..."
					confirm-type="send"
					@confirm="sendMessage"
				/>
				<view v-if="inputText" class="clear-btn" @click="inputText = ''">×</view>
			</view>
			<button class="send-btn" :class="{ active: inputText }" @click="sendMessage">
				<text v-if="!isThinking">➤</text>
				<view v-else class="spinner"></view>
			</button>
		</view>

		<!-- 终端弹窗 -->
		<view v-if="showTerminal" class="terminal-modal" @click.self="showTerminal = false">
			<view class="terminal-window">
				<view class="terminal-header">
					<text class="terminal-title">💻 终端输出</text>
					<text class="close-btn" @click="showTerminal = false">✕</text>
				</view>
				<scroll-view scroll-y class="terminal-content">
					<text class="terminal-text">{{ terminalOutput }}</text>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			currentTab: 'chat',
			inputText: '',
			isThinking: false,
			showTerminal: false,
			terminalOutput: '> 等待命令...\n',
			connectionStatus: 'connected',
			messages: [
				{ type: 'ai', content: '欢迎使用 OpenCode Remote！\n\n我是你的 AI 编程助手，可以帮你：\n• 💻 编写和运行代码\n• 📂 管理文件\n• 🖥️ 控制电脑\n• 🔧 执行系统命令\n\n请直接输入需求或点击下方快捷操作。', time: '09:30' }
			],
			tabs: [
				{ id: 'chat', name: 'AI助手', icon: '🤖' },
				{ id: 'code', name: '代码', icon: '💻' },
				{ id: 'files', name: '文件', icon: '📂' }
			],
			quickCommands: [
				{ icon: '🔍', label: '查看目录', command: 'ls -la', color: '#00d4ff' },
				{ icon: '📊', label: '系统状态', command: 'top -n 1', color: '#7c3aed' },
				{ icon: '💾', label: '磁盘使用', command: 'df -h', color: '#10b981' },
				{ icon: '🌐', label: '网络信息', command: 'ifconfig', color: '#f59e0b' },
				{ icon: '📋', label: '进程列表', command: 'ps aux', color: '#ef4444' },
				{ icon: '🔧', label: '安装依赖', command: 'npm install', color: '#8b5cf6' }
			],
			codeContent: '// 欢迎使用 OpenCode Remote\n// 在这里编写代码，然后点击运行\n\nconsole.log("Hello from mobile!");',
			files: [
				{ name: 'projects', type: 'folder', size: '--', modified: '2天前' },
				{ name: 'app.js', type: 'file', size: '2.4KB', modified: '1小时前' },
				{ name: 'package.json', type: 'file', size: '856B', modified: '3小时前' },
				{ name: 'README.md', type: 'file', size: '1.2KB', modified: '1天前' }
			]
		}
	},
	computed: {
		currentTabIndex() {
			return this.tabs.findIndex(t => t.id === this.currentTab)
		},
		connectionText() {
			return this.connectionStatus === 'connected' ? '已连接' : '未连接'
		}
	},
	methods: {
		particleStyle(i) {
			return {
				left: Math.random() * 100 + '%',
				top: Math.random() * 100 + '%',
				animationDelay: Math.random() * 5 + 's',
				animationDuration: (Math.random() * 10 + 10) + 's'
			}
		},
		onSwiperChange(e) {
			this.currentTab = this.tabs[e.detail.current].id
		},
		async executeCommand(cmd) {
			this.inputText = cmd.command
			await this.sendMessage()
		},
		async sendMessage() {
			if (!this.inputText.trim() || this.isThinking) return

			const text = this.inputText
			this.messages.push({
				type: 'user',
				content: text,
				time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
			})
			this.inputText = ''
			this.isThinking = true

			try {
				// 调用 PC 端 API
				const serverUrl = uni.getStorageSync('server_url') || 'http://localhost:8000'
				const res = await uni.request({
					url: `${serverUrl}/api/chat`,
					method: 'POST',
					data: { message: text },
					timeout: 30000
				})

				if (res.statusCode === 200) {
					this.messages.push({
						type: 'ai',
						content: res.data.response,
						time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
					})
				}
			} catch (e) {
				this.messages.push({
					type: 'ai',
					content: '❌ 连接失败，请检查服务器地址',
					time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
				})
			}

			this.isThinking = false
		},
		runCode() {
			uni.showToast({ title: '运行中...', icon: 'loading' })
			// 实际项目中这里会发送代码到服务器执行
		},
		saveCode() {
			uni.showToast({ title: '已保存', icon: 'success' })
		},
		refreshFiles() {
			uni.showToast({ title: '刷新中...', icon: 'loading' })
		},
		openFile(file) {
			if (file.type === 'folder') {
				uni.showToast({ title: '打开文件夹: ' + file.name, icon: 'none' })
			} else {
				uni.showToast({ title: '打开文件: ' + file.name, icon: 'none' })
			}
		},
		goToSettings() {
			uni.navigateTo({ url: '/pages/settings/settings' })
		},
		goToApiConfig() {
			uni.navigateTo({ url: '/pages/config/api' })
		}
	}
}
</script>

<style>
/* ===== 基础样式 ===== */
.container {
	min-height: 100vh;
	background: #0a0a0f;
	position: relative;
	overflow: hidden;
}

/* ===== 科技背景 ===== */
.tech-bg {
	position: fixed;
	inset: 0;
	z-index: 0;
	overflow: hidden;
}

.grid-lines {
	position: absolute;
	inset: 0;
	background-image: 
		linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
		linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
	background-size: 50px 50px;
	animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
	0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
	100% { transform: perspective(500px) rotateX(60deg) translateY(50px); }
}

.glow-orb {
	position: absolute;
	border-radius: 50%;
	filter: blur(80px);
	opacity: 0.3;
	animation: orbFloat 8s ease-in-out infinite;
}

.orb-1 {
	width: 400px;
	height: 400px;
	background: linear-gradient(135deg, #00d4ff, #7c3aed);
	top: -100px;
	right: -100px;
}

.orb-2 {
	width: 300px;
	height: 300px;
	background: linear-gradient(135deg, #7c3aed, #00d4ff);
	bottom: -50px;
	left: -50px;
	animation-delay: -4s;
}

@keyframes orbFloat {
	0%, 100% { transform: translate(0, 0) scale(1); }
	50% { transform: translate(30px, -30px) scale(1.1); }
}

.particles {
	position: absolute;
	inset: 0;
}

.particle {
	position: absolute;
	width: 2px;
	height: 2px;
	background: #00d4ff;
	border-radius: 50%;
	animation: particleFloat linear infinite;
	opacity: 0.5;
}

@keyframes particleFloat {
	0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
	10% { opacity: 1; }
	90% { opacity: 1; }
	100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
}

/* ===== 导航栏 ===== */
.nav-bar {
	position: sticky;
	top: 0;
	z-index: 100;
	background: rgba(10, 10, 15, 0.8);
	backdrop-filter: blur(20px);
	border-bottom: 1px solid rgba(0, 212, 255, 0.1);
	padding-top: var(--status-bar-height);
}

.nav-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
}

.brand {
	display: flex;
	align-items: center;
	gap: 12px;
}

.logo-pulse {
	position: relative;
	width: 44px;
	height: 44px;
}

.logo-ring {
	position: absolute;
	inset: 0;
	border: 2px solid rgba(0, 212, 255, 0.3);
	border-radius: 12px;
	animation: ringPulse 2s ease-out infinite;
}

.logo-ring.r2 {
	animation-delay: 1s;
}

@keyframes ringPulse {
	0% { transform: scale(1); opacity: 1; }
	100% { transform: scale(1.3); opacity: 0; }
}

.logo-core {
	position: absolute;
	inset: 4px;
	background: linear-gradient(135deg, #00d4ff, #7c3aed);
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 22px;
	box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
}

.brand-text {
	display: flex;
	flex-direction: column;
}

.app-name {
	color: #fff;
	font-size: 18px;
	font-weight: 700;
	letter-spacing: 0.5px;
}

.app-name .highlight {
	background: linear-gradient(90deg, #00d4ff, #7c3aed);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.connection-badge {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 11px;
	color: rgba(255, 255, 255, 0.5);
}

.connection-badge.connected .pulse-dot {
	background: #10b981;
	box-shadow: 0 0 10px #10b981;
}

.pulse-dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: #ef4444;
	animation: dotPulse 1.5s ease-in-out infinite;
}

@keyframes dotPulse {
	0%, 100% { opacity: 1; transform: scale(1); }
	50% { opacity: 0.5; transform: scale(1.2); }
}

.nav-actions {
	display: flex;
	gap: 8px;
}

.icon-btn {
	width: 40px;
	height: 40px;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(0, 212, 255, 0.2);
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
}

.icon-btn:active {
	background: rgba(0, 212, 255, 0.2);
	transform: scale(0.95);
}

.icon-btn .icon {
	font-size: 18px;
}

/* ===== 标签页 ===== */
.tab-bar {
	display: flex;
	background: rgba(255, 255, 255, 0.03);
	border-bottom: 1px solid rgba(0, 212, 255, 0.1);
	padding: 0 16px;
}

.tab-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
	padding: 12px 0;
	position: relative;
	opacity: 0.5;
	transition: all 0.3s ease;
}

.tab-item.active {
	opacity: 1;
}

.tab-icon {
	font-size: 20px;
}

.tab-text {
	color: #fff;
	font-size: 12px;
}

.tab-indicator {
	position: absolute;
	bottom: 0;
	left: 20%;
	right: 20%;
	height: 3px;
	background: linear-gradient(90deg, #00d4ff, #7c3aed);
	border-radius: 3px 3px 0 0;
	animation: indicatorSlide 0.3s ease;
}

@keyframes indicatorSlide {
	from { transform: scaleX(0); }
	to { transform: scaleX(1); }
}

/* ===== 内容区 ===== */
.content-swiper {
	flex: 1;
	height: calc(100vh - 180px);
}

.tab-content {
	height: 100%;
	padding: 16px;
}

/* ===== 快捷指令面板 ===== */
.quick-panel {
	background: rgba(255, 255, 255, 0.03);
	border: 1px solid rgba(0, 212, 255, 0.1);
	border-radius: 16px;
	padding: 16px;
	margin-bottom: 16px;
}

.panel-title {
	color: #fff;
	font-size: 14px;
	font-weight: 600;
	margin-bottom: 12px;
	display: block;
}

.quick-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 10px;
}

.quick-btn {
	position: relative;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 12px;
	padding: 12px 8px;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
	overflow: hidden;
	animation: fadeInUp 0.5s ease forwards;
	animation-delay: var(--delay);
	opacity: 0;
}

@keyframes fadeInUp {
	from { opacity: 0; transform: translateY(20px); }
	to { opacity: 1; transform: translateY(0); }
}

.quick-glow {
	position: absolute;
	inset: 0;
	opacity: 0.1;
	transition: opacity 0.3s ease;
}

.quick-btn:active .quick-glow {
	opacity: 0.3;
}

.quick-icon {
	font-size: 24px;
	z-index: 1;
}

.quick-label {
	color: rgba(255, 255, 255, 0.8);
	font-size: 11px;
	z-index: 1;
}

/* ===== 聊天区域 ===== */
.chat-container {
	padding-bottom: 100px;
}

.message-item {
	display: flex;
	gap: 10px;
	margin-bottom: 16px;
	animation: messageSlide 0.3s ease;
}

.message-item.user {
	flex-direction: row-reverse;
}

@keyframes messageSlide {
	from { opacity: 0; transform: translateX(-20px); }
	to { opacity: 1; transform: translateX(0); }
}

.message-item.user {
	animation-name: messageSlideRight;
}

@keyframes messageSlideRight {
	from { opacity: 0; transform: translateX(20px); }
	to { opacity: 1; transform: translateX(0); }
}

.msg-avatar {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 16px;
	flex-shrink: 0;
}

.msg-content {
	display: flex;
	flex-direction: column;
	max-width: 75%;
}

.msg-bubble {
	padding: 12px 16px;
	border-radius: 16px;
	position: relative;
}

.msg-bubble.ai {
	background: rgba(0, 212, 255, 0.1);
	border: 1px solid rgba(0, 212, 255, 0.2);
	border-top-left-radius: 4px;
}

.msg-bubble.user {
	background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2));
	border: 1px solid rgba(59, 130, 246, 0.3);
	border-top-right-radius: 4px;
}

.msg-text {
	color: #fff;
	font-size: 14px;
	line-height: 1.6;
	white-space: pre-wrap;
}

.msg-time {
	color: rgba(255, 255, 255, 0.4);
	font-size: 10px;
	margin-top: 4px;
	align-self: flex-end;
}

.thinking-dots {
	display: flex;
	gap: 4px;
	padding: 4px 8px;
}

.thinking-dots .dot {
	color: #00d4ff;
	font-size: 8px;
	animation: dotBounce 1s ease-in-out infinite;
}

@keyframes dotBounce {
	0%, 100% { transform: translateY(0); }
	50% { transform: translateY(-4px); }
}

/* ===== 代码编辑器标签 ===== */
.code-tab {
	display: flex;
	flex-direction: column;
}

.editor-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(0, 212, 255, 0.2);
	border-radius: 12px;
	padding: 12px 16px;
	margin-bottom: 12px;
}

.editor-title {
	color: #fff;
	font-size: 14px;
	font-weight: 600;
}

.editor-actions {
	display: flex;
	gap: 12px;
}

.editor-actions .action {
	color: #00d4ff;
	font-size: 13px;
	padding: 4px 8px;
	background: rgba(0, 212, 255, 0.1);
	border-radius: 6px;
}

.code-editor {
	flex: 1;
	background: rgba(0, 0, 0, 0.5);
	border: 1px solid rgba(0, 212, 255, 0.2);
	border-radius: 12px;
	padding: 16px;
	color: #00d4ff;
	font-family: 'Consolas', 'Monaco', monospace;
	font-size: 13px;
	line-height: 1.8;
}

/* ===== 文件列表 ===== */
.file-toolbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12px;
}

.toolbar-title {
	color: #fff;
	font-size: 16px;
	font-weight: 600;
}

.refresh-btn {
	font-size: 18px;
	padding: 8px;
}

.file-list {
	background: rgba(255, 255, 255, 0.03);
	border: 1px solid rgba(0, 212, 255, 0.1);
	border-radius: 12px;
	overflow: hidden;
}

.file-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 14px 16px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	transition: background 0.3s ease;
}

.file-item:last-child {
	border-bottom: none;
}

.file-item:active {
	background: rgba(0, 212, 255, 0.1);
}

.file-icon {
	font-size: 24px;
}

.file-info {
	flex: 1;
}

.file-name {
	color: #fff;
	font-size: 14px;
	display: block;
}

.file-meta {
	color: rgba(255, 255, 255, 0.4);
	font-size: 11px;
}

.file-action {
	color: rgba(255, 255, 255, 0.3);
	font-size: 18px;
}

/* ===== 底部输入栏 ===== */
.input-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: rgba(10, 10, 15, 0.95);
	backdrop-filter: blur(20px);
	border-top: 1px solid rgba(0, 212, 255, 0.2);
	padding: 12px 16px;
	padding-bottom: calc(12px + env(safe-area-inset-bottom));
	display: flex;
	align-items: center;
	gap: 12px;
	z-index: 50;
}

.input-wrapper {
	flex: 1;
	position: relative;
}

.command-input {
	width: 100%;
	height: 46px;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(0, 212, 255, 0.2);
	border-radius: 23px;
	padding: 0 40px 0 18px;
	color: #fff;
	font-size: 14px;
}

.command-input::placeholder {
	color: rgba(255, 255, 255, 0.4);
}

.clear-btn {
	position: absolute;
	right: 12px;
	top: 50%;
	transform: translateY(-50%);
	color: rgba(255, 255, 255, 0.4);
	font-size: 20px;
	padding: 4px;
}

.send-btn {
	width: 46px;
	height: 46px;
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid rgba(0, 212, 255, 0.3);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: rgba(255, 255, 255, 0.5);
	transition: all 0.3s ease;
}

.send-btn.active {
	background: linear-gradient(135deg, #00d4ff, #7c3aed);
	border-color: transparent;
	color: #fff;
	box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
}

.spinner {
	width: 20px;
	height: 20px;
	border: 2px solid rgba(255, 255, 255, 0.3);
	border-top-color: #00d4ff;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

/* ===== 终端弹窗 ===== */
.terminal-modal {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.8);
	z-index: 200;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px;
}

.terminal-window {
	width: 100%;
	max-width: 400px;
	background: #0d1117;
	border: 1px solid rgba(0, 212, 255, 0.3);
	border-radius: 12px;
	overflow: hidden;
}

.terminal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
	background: rgba(0, 212, 255, 0.1);
	border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}

.terminal-title {
	color: #fff;
	font-size: 14px;
	font-weight: 600;
}

.close-btn {
	color: rgba(255, 255, 255, 0.5);
	font-size: 16px;
	padding: 4px;
}

.terminal-content {
	max-height: 300px;
	padding: 16px;
}

.terminal-text {
	color: #00d4ff;
	font-family: 'Consolas', monospace;
	font-size: 12px;
	line-height: 1.8;
	white-space: pre-wrap;
}
</style>
