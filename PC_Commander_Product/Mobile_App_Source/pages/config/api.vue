<template>
	<view class="manifold-container">
		<!-- 顶部导航 -->
		<view class="manifold-nav">
			<view class="nav-inner">
				<view class="nav-back" @click="goBack">
					<text class="arrow">←</text>
				</view>
				<text class="nav-brand">Manifold</text>
				<view class="nav-lang" @click="toggleLanguage">
					<text>{{ currentLang.flag }}</text>
				</view>
			</view>
		</view>

		<scroll-view class="manifold-content" scroll-y>
			<!-- Hero 区域 -->
			<view class="hero-section">
				<text class="hero-label">API Configuration</text>
				<text class="hero-title">Better AI</text>
				<text class="hero-subtitle">Configure your AI providers</text>
			</view>

			<!-- 状态概览 -->
			<view class="status-section">
				<view class="section-label">System Status</view>
				<view class="status-grid">
					<view 
						v-for="(provider, key) in providerList" 
						:key="key"
						class="status-item"
						:class="{ active: provider.enabled, [provider.status]: true }"
						@click="scrollToProvider(key)"
					>
						<view class="status-dot"></view>
						<text class="status-name">{{ $t(`providers.${key}.name`) }}</text>
						<text class="status-text">{{ $t(`status.${provider.status}`) }}</text>
					</view>
				</view>
			</view>

			<!-- 配置区域 -->
			<view class="config-section">
				<view class="section-label">Provider Settings</view>

				<!-- OpenCode -->
				<view id="opencode" class="provider-block" :class="{ expanded: opencodeConfig.enabled }">
					<view class="block-header" @click="toggleProvider('opencode')">
						<view class="block-meta">
							<text class="block-number">01</text>
							<view class="block-title-wrap">
								<text class="block-title">{{ $t('providers.opencode.name') }}</text>
								<text class="block-desc">{{ $t('providers.opencode.desc') }}</text>
							</view>
						</view>
						<view class="block-toggle">
							<view class="toggle-switch" :class="{ on: opencodeConfig.enabled }">
								<view class="toggle-knob"></view>
							</view>
						</view>
					</view>

					<view v-if="opencodeConfig.enabled" class="block-content">
						<view class="form-row">
							<view class="form-field">
								<label class="field-label">{{ $t('config.apiEndpoint') }}</label>
								<input 
									class="field-input" 
									v-model="opencodeConfig.baseURL"
									placeholder="http://localhost:12345"
								/>
							</view>
						</view>

						<view class="form-row">
							<view class="form-field">
								<label class="field-label">{{ $t('config.apiKeyOptional') }}</label>
								<input 
									class="field-input" 
									v-model="opencodeConfig.apiKey"
									password
									placeholder="••••••••"
								/>
							</view>
						</view>

						<view class="form-row">
							<view class="form-field">
								<label class="field-label">{{ $t('config.model') }}</label>
								<view class="option-list">
									<view 
										v-for="model in opencodeModels" 
										:key="model"
										class="option-item"
										:class="{ active: opencodeConfig.model === model }"
										@click="opencodeConfig.model = model"
									>
										<text>{{ model }}</text>
									</view>
								</view>
							</view>
						</view>

						<button 
							class="action-btn"
							:class="getButtonClass('opencode')"
							@click="testConnection('opencode')"
							:disabled="testing.opencode"
						>
							<text v-if="testing.opencode" class="btn-spinner"></text>
							<text v-else>{{ getButtonText('opencode') }}</text>
						</button>
					</view>
				</view>

				<!-- OpenClaw -->
				<view id="openclaw" class="provider-block" :class="{ expanded: openclawConfig.enabled }">
					<view class="block-header" @click="toggleProvider('openclaw')">
						<view class="block-meta">
							<text class="block-number">02</text>
							<view class="block-title-wrap">
								<text class="block-title">{{ $t('providers.openclaw.name') }}</text>
								<text class="block-desc">{{ $t('providers.openclaw.desc') }}</text>
							</view>
						</view>
						<view class="block-toggle">
							<view class="toggle-switch" :class="{ on: openclawConfig.enabled }">
								<view class="toggle-knob"></view>
							</view>
						</view>
					</view>

					<view v-if="openclawConfig.enabled" class="block-content">
						<view class="form-row">
							<view class="form-field">
								<label class="field-label">{{ $t('config.gatewayUrl') }}</label>
								<input 
									class="field-input" 
									v-model="openclawConfig.gatewayUrl"
									placeholder="ws://localhost:18789"
								/>
							</view>
						</view>

						<view class="form-row">
							<view class="form-field">
								<label class="field-label">{{ $t('config.tokenOptional') }}</label>
								<input 
									class="field-input" 
									v-model="openclawConfig.token"
									password
									placeholder="••••••••"
								/>
							</view>
						</view>

						<view class="form-row">
							<view class="form-field">
								<label class="field-label">{{ $t('config.agentId') }}</label>
								<input 
									class="field-input" 
									v-model="openclawConfig.agentId"
									placeholder="main"
								/>
							</view>
						</view>

						<button 
							class="action-btn secondary"
							:class="getButtonClass('openclaw')"
							@click="testConnection('openclaw')"
							:disabled="testing.openclaw"
						>
							<text v-if="testing.openclaw" class="btn-spinner"></text>
							<text v-else>{{ getButtonText('openclaw') }}</text>
						</button>
					</view>
				</view>

				<!-- OpenAI -->
				<view id="openai" class="provider-block" :class="{ expanded: openaiConfig.enabled }">
					<view class="block-header" @click="toggleProvider('openai')">
						<view class="block-meta">
							<text class="block-number">03</text>
							<view class="block-title-wrap">
								<text class="block-title">{{ $t('providers.openai.name') }}</text>
								<text class="block-desc">{{ $t('providers.openai.desc') }}</text>
							</view>
						</view>
						<view class="block-toggle">
							<view class="toggle-switch" :class="{ on: openaiConfig.enabled }">
								<view class="toggle-knob"></view>
							</view>
						</view>
					</view>

					<view v-if="openaiConfig.enabled" class="block-content">
						<view class="form-row">
							<view class="form-field">
								<label class="field-label required">{{ $t('config.apiKey') }}</label>
								<input 
									class="field-input" 
									v-model="openaiConfig.apiKey"
									password
									placeholder="sk-..."
								/>
							</view>
						</view>

						<view class="form-row">
							<view class="form-field">
								<label class="field-label">{{ $t('config.baseUrlOptional') }}</label>
								<input 
									class="field-input" 
									v-model="openaiConfig.baseURL"
									placeholder="https://api.openai.com/v1"
								/>
							</view>
						</view>

						<view class="form-row">
							<view class="form-field">
								<label class="field-label">{{ $t('config.model') }}</label>
								<view class="option-list">
									<view 
										v-for="model in openaiModels" 
										:key="model"
										class="option-item"
										:class="{ active: openaiConfig.model === model }"
										@click="openaiConfig.model = model"
									>
										<text>{{ model }}</text>
									</view>
								</view>
							</view>
						</view>

						<button 
							class="action-btn secondary"
							:class="getButtonClass('openai')"
							@click="testConnection('openai')"
							:disabled="testing.openai"
						>
							<text v-if="testing.openai" class="btn-spinner"></text>
							<text v-else>{{ getButtonText('openai') }}</text>
						</button>
					</view>
				</view>
			</view>

			<!-- 全局设置 -->
			<view class="global-section">
				<view class="section-label">Global Settings</view>
				
				<view class="settings-list">
					<view class="setting-item">
						<view class="setting-info">
							<text class="setting-label">{{ $t('global.defaultProvider') }}</text>
						</view>
						<picker mode="selector" :range="providerOptions" :value="defaultProviderIndex" @change="onDefaultProviderChange">
							<view class="setting-value">
								<text>{{ defaultProvider }}</text>
								<text class="arrow">→</text>
							</view>
						</picker>
					</view>

					<view class="setting-item">
						<view class="setting-info">
							<text class="setting-label">{{ $t('global.timeout') }}</text>
							<text class="setting-hint">{{ timeout }}s</text>
						</view>
						<slider :value="timeout" @change="onTimeoutChange" min="10" max="120" show-value activeColor="#0F2943" block-size="20" />
					</view>

					<view class="setting-item">
						<view class="setting-info">
							<text class="setting-label">{{ $t('global.streamMode') }}</text>
							<text class="setting-hint">{{ $t('global.streamModeDesc') }}</text>
						</view>
						<switch :checked="streamMode" @change="e => streamMode = e.detail.value" color="#0F2943" />
					</view>
				</view>
			</view>

			<!-- 底部操作 -->
			<view class="footer-section">
				<button class="primary-btn" @click="saveAllConfigs">
					<text>{{ $t('actions.save') }}</text>
				</button>
				<button class="text-btn" @click="resetConfigs">
					<text>{{ $t('actions.reset') }}</text>
				</button>
			</view>

			<view class="footer-brand">
				<text>Manifold AI</text>
				<text class="footer-copy">© 2025 All rights reserved</text>
			</view>

			<view class="safe-area"></view>
		</scroll-view>

		<!-- Toast -->
		<view v-if="toast.show" class="manifold-toast" :class="toast.type">
			<text class="toast-icon">{{ toast.icon }}</text>
			<text class="toast-text">{{ toast.message }}</text>
		</view>
	</view>
</template>

<script>
import i18n from '../../utils/i18n.js'

export default {
	data() {
		return {
			opencodeConfig: {
				enabled: false,
				baseURL: 'http://localhost:12345',
				apiKey: '',
				model: 'claude-3-opus',
				status: 'offline'
			},
			opencodeModels: ['claude-3-opus', 'claude-3-sonnet', 'gpt-4', 'gpt-3.5-turbo'],
			openclawConfig: {
				enabled: false,
				gatewayUrl: 'ws://localhost:18789',
				token: '',
				agentId: 'main',
				status: 'offline'
			},
			openaiConfig: {
				enabled: false,
				apiKey: '',
				baseURL: 'https://api.openai.com/v1',
				model: 'gpt-4',
				status: 'offline'
			},
			openaiModels: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
			defaultProvider: 'Auto',
			timeout: 60,
			streamMode: true,
			testing: {
				opencode: false,
				openclaw: false,
				openai: false
			},
			toast: {
				show: false,
				message: '',
				type: 'success',
				icon: '✓'
			}
		}
	},
	computed: {
		providerList() {
			return {
				opencode: { enabled: this.opencodeConfig.enabled, status: this.opencodeConfig.status },
				openclaw: { enabled: this.openclawConfig.enabled, status: this.openclawConfig.status },
				openai: { enabled: this.openaiConfig.enabled, status: this.openaiConfig.status }
			}
		},
		providerOptions() {
			return ['Auto', 'OpenCode', 'OpenClaw', 'OpenAI']
		},
		defaultProviderIndex() {
			return this.providerOptions.indexOf(this.defaultProvider)
		},
		currentLang() {
			const locales = i18n.getSupportedLocales()
			return locales.find(l => l.code === i18n.getLocale()) || locales[0]
		}
	},
	methods: {
		$t(key, defaultValue) {
			return i18n.t(key, defaultValue)
		},
		toggleLanguage() {
			const newLocale = i18n.toggleLocale()
			this.showToast(newLocale === 'zh-CN' ? '已切换为中文' : 'Switched to English', 'success', '🌐')
			this.$forceUpdate()
		},
		toggleProvider(provider) {
			this[`${provider}Config`].enabled = !this[`${provider}Config`].enabled
			if (this[`${provider}Config`].enabled) {
				this[`${provider}Config`].status = 'offline'
			}
		},
		scrollToProvider(provider) {
			uni.pageScrollTo({
				selector: `#${provider}`,
				duration: 300
			})
		},
		getButtonClass(provider) {
			const status = this[`${provider}Config`].status
			return { success: status === 'online', error: status === 'error' }
		},
		getButtonText(provider) {
			const status = this[`${provider}Config`].status
			if (this.testing[provider]) return this.$t('status.testing')
			if (status === 'online') return this.$t('status.connected')
			return this.$t('actions.testConnection')
		},
		async testConnection(provider) {
			this.testing[provider] = true
			this[`${provider}Config`].status = 'testing'
			
			try {
				const serverUrl = uni.getStorageSync('server_url') || 'http://localhost:8000'
				const res = await uni.request({
					url: `${serverUrl}/api/config/test`,
					method: 'POST',
					data: { provider, config: this[`${provider}Config`] },
					timeout: 10000
				})

				if (res.statusCode === 200 && res.data.success) {
					this[`${provider}Config`].status = 'online'
					this.showToast(this.$t('messages.testSuccess'), 'success', '✓')
				} else {
					this[`${provider}Config`].status = 'error'
					this.showToast(res.data.error || this.$t('messages.testFailed'), 'error', '✕')
				}
			} catch (e) {
				this[`${provider}Config`].status = 'error'
				this.showToast(this.$t('messages.testFailed'), 'error', '✕')
			} finally {
				this.testing[provider] = false
			}
		},
		async saveAllConfigs() {
			uni.setStorageSync('opencode_config', this.opencodeConfig)
			uni.setStorageSync('openclaw_config', this.openclawConfig)
			uni.setStorageSync('openai_config', this.openaiConfig)
			uni.setStorageSync('global_config', {
				defaultProvider: this.defaultProvider,
				timeout: this.timeout,
				streamMode: this.streamMode
			})

			try {
				const serverUrl = uni.getStorageSync('server_url') || 'http://localhost:8000'
				await uni.request({
					url: `${serverUrl}/api/config/update`,
					method: 'POST',
					data: {
						opencode: this.opencodeConfig,
						openclaw: this.openclawConfig,
						openai: this.openaiConfig,
						global: {
							defaultProvider: this.defaultProvider,
							timeout: this.timeout,
							streamMode: this.streamMode
						}
					}
				})
			} catch (e) {
				console.error('Sync error:', e)
			}

			this.showToast(this.$t('messages.saveSuccess'), 'success', '✓')
		},
		resetConfigs() {
			uni.showModal({
				title: this.$t('actions.reset'),
				content: this.$t('messages.resetConfirm'),
				confirmText: this.$t('actions.confirm'),
				cancelText: this.$t('actions.cancel'),
				success: (res) => {
					if (res.confirm) {
						this.opencodeConfig = { enabled: false, baseURL: 'http://localhost:12345', apiKey: '', model: 'claude-3-opus', status: 'offline' }
						this.openclawConfig = { enabled: false, gatewayUrl: 'ws://localhost:18789', token: '', agentId: 'main', status: 'offline' }
						this.openaiConfig = { enabled: false, apiKey: '', baseURL: 'https://api.openai.com/v1', model: 'gpt-4', status: 'offline' }
						this.defaultProvider = 'Auto'
						this.timeout = 60
						this.streamMode = true

						uni.removeStorageSync('opencode_config')
						uni.removeStorageSync('openclaw_config')
						uni.removeStorageSync('openai_config')
						uni.removeStorageSync('global_config')

						this.showToast(this.$t('actions.reset') + ' OK', 'success', '✓')
					}
				}
			})
		},
		showToast(message, type = 'success', icon = '✓') {
			this.toast = { show: true, message, type, icon }
			setTimeout(() => { this.toast.show = false }, 2500)
		},
		onDefaultProviderChange(e) {
			this.defaultProvider = this.providerOptions[e.detail.value]
		},
		onTimeoutChange(e) {
			this.timeout = e.detail.value
		},
		goBack() {
			uni.navigateBack()
		}
	},
	onLoad() {
		const opencode = uni.getStorageSync('opencode_config')
		const openclaw = uni.getStorageSync('openclaw_config')
		const openai = uni.getStorageSync('openai_config')
		const global = uni.getStorageSync('global_config')

		if (opencode) this.opencodeConfig = { ...this.opencodeConfig, ...opencode }
		if (openclaw) this.openclawConfig = { ...this.openclawConfig, ...openclaw }
		if (openai) this.openaiConfig = { ...this.openaiConfig, ...openai }
		if (global) {
			this.defaultProvider = global.defaultProvider || 'Auto'
			this.timeout = global.timeout || 60
			this.streamMode = global.streamMode !== false
		}
	}
}
</script>

<style>
/* ===== Manifold AI 风格 - 专业科技 ===== */
.manifold-container {
	min-height: 100vh;
	background: #FFFFFF;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ===== 导航栏 ===== */
.manifold-nav {
	position: sticky;
	top: 0;
	z-index: 100;
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20px);
	border-bottom: 1px solid rgba(0, 0, 0, 0.06);
	padding-top: var(--status-bar-height);
}

.nav-inner {
	height: 56px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 20px;
}

.nav-back {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}

.arrow {
	font-size: 20px;
	color: #0F2943;
}

.nav-brand {
	font-size: 18px;
	font-weight: 700;
	color: #0F2943;
	letter-spacing: -0.5px;
}

.nav-lang {
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 18px;
	cursor: pointer;
	border-radius: 8px;
	transition: background 0.2s;
}

.nav-lang:hover {
	background: rgba(0, 0, 0, 0.04);
}

/* ===== 内容区 ===== */
.manifold-content {
	padding: 0 24px;
}

/* ===== Hero 区域 ===== */
.hero-section {
	padding: 40px 0 32px;
	border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.hero-label {
	display: block;
	font-size: 12px;
	font-weight: 600;
	color: #6B7280;
	text-transform: uppercase;
	letter-spacing: 1px;
	margin-bottom: 12px;
}

.hero-title {
	display: block;
	font-size: 40px;
	font-weight: 700;
	color: #0F2943;
	line-height: 1.2;
	margin-bottom: 8px;
}

.hero-subtitle {
	display: block;
	font-size: 16px;
	color: #6B7280;
	line-height: 1.5;
}

/* ===== 区块标签 ===== */
.section-label {
	font-size: 11px;
	font-weight: 600;
	color: #6B7280;
	text-transform: uppercase;
	letter-spacing: 1.5px;
	margin-bottom: 16px;
	margin-top: 32px;
}

/* ===== 状态网格 ===== */
.status-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 12px;
}

.status-item {
	background: #F9FAFB;
	border: 1px solid transparent;
	border-radius: 12px;
	padding: 20px 12px;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	cursor: pointer;
	transition: all 0.2s;
}

.status-item:hover {
	background: #F3F4F6;
}

.status-item.active {
	background: #FFFFFF;
	border-color: #0F2943;
}

.status-item.online {
	background: #F0FDF4;
	border-color: #10B981;
}

.status-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: #D1D5DB;
}

.status-item.active .status-dot {
	background: #0F2943;
}

.status-item.online .status-dot {
	background: #10B981;
}

.status-name {
	font-size: 14px;
	font-weight: 600;
	color: #111827;
}

.status-text {
	font-size: 11px;
	font-weight: 500;
	color: #6B7280;
}

.status-item.online .status-text {
	color: #10B981;
}

/* ===== Provider 区块 ===== */
.provider-block {
	background: #FFFFFF;
	border: 1px solid #E5E7EB;
	border-radius: 16px;
	margin-bottom: 16px;
	overflow: hidden;
}

.provider-block.expanded {
	border-color: #0F2943;
}

.block-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20px;
	cursor: pointer;
}

.block-meta {
	display: flex;
	align-items: flex-start;
	gap: 16px;
}

.block-number {
	font-size: 12px;
	font-weight: 600;
	color: #9CA3AF;
	font-family: 'SF Mono', monospace;
}

.block-title-wrap {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.block-title {
	font-size: 17px;
	font-weight: 600;
	color: #111827;
}

.block-desc {
	font-size: 13px;
	color: #6B7280;
}

.block-toggle {
	padding-left: 16px;
}

.toggle-switch {
	width: 48px;
	height: 28px;
	background: #E5E7EB;
	border-radius: 14px;
	position: relative;
	cursor: pointer;
	transition: background 0.3s;
}

.toggle-switch.on {
	background: #0F2943;
}

.toggle-knob {
	position: absolute;
	width: 24px;
	height: 24px;
	background: #FFFFFF;
	border-radius: 50%;
	top: 2px;
	left: 2px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.toggle-switch.on .toggle-knob {
	transform: translateX(20px);
}

/* ===== 区块内容 ===== */
.block-content {
	padding: 0 20px 20px;
	border-top: 1px solid #F3F4F6;
}

.form-row {
	padding-top: 20px;
}

.form-field {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.field-label {
	font-size: 13px;
	font-weight: 500;
	color: #374151;
}

.field-label.required::after {
	content: ' *';
	color: #EF4444;
}

.field-input {
	height: 48px;
	background: #F9FAFB;
	border: 1px solid #E5E7EB;
	border-radius: 10px;
	padding: 0 16px;
	font-size: 15px;
	color: #111827;
	transition: all 0.2s;
}

.field-input:focus {
	background: #FFFFFF;
	border-color: #0F2943;
	outline: none;
}

.option-list {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.option-item {
	padding: 10px 16px;
	background: #F9FAFB;
	border: 1px solid transparent;
	border-radius: 8px;
	font-size: 13px;
	color: #6B7280;
	cursor: pointer;
	transition: all 0.2s;
}

.option-item:hover {
	background: #F3F4F6;
}

.option-item.active {
	background: #0F2943;
	color: #FFFFFF;
}

/* ===== 按钮 ===== */
.action-btn {
	width: 100%;
	height: 48px;
	background: #0F2943;
	border: none;
	border-radius: 10px;
	color: #FFFFFF;
	font-size: 15px;
	font-weight: 600;
	margin-top: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	cursor: pointer;
	transition: all 0.2s;
}

.action-btn:hover {
	background: #1a3d5c;
}

.action-btn.secondary {
	background: #FFFFFF;
	color: #0F2943;
	border: 1px solid #E5E7EB;
}

.action-btn.secondary:hover {
	background: #F9FAFB;
}

.action-btn.success {
	background: #10B981;
}

.action-btn.error {
	background: #EF4444;
}

.btn-spinner {
	width: 18px;
	height: 18px;
	border: 2px solid rgba(255, 255, 255, 0.3);
	border-top-color: #FFFFFF;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

/* ===== 全局设置 ===== */
.global-section {
	margin-top: 32px;
}

.settings-list {
	background: #FFFFFF;
	border: 1px solid #E5E7EB;
	border-radius: 16px;
	overflow: hidden;
}

.setting-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 20px;
	gap: 16px;
}

.setting-item:not(:last-child) {
	border-bottom: 1px solid #F3F4F6;
}

.setting-info {
	display: flex;
	flex-direction: column;
	gap: 2px;
	flex: 1;
}

.setting-label {
	font-size: 15px;
	font-weight: 500;
	color: #111827;
}

.setting-hint {
	font-size: 13px;
	color: #6B7280;
}

.setting-value {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 15px;
	font-weight: 500;
	color: #0F2943;
}

.arrow {
	font-size: 14px;
	color: #9CA3AF;
}

/* ===== 底部操作 ===== */
.footer-section {
	margin-top: 40px;
	padding-bottom: 20px;
}

.primary-btn {
	width: 100%;
	height: 52px;
	background: #0F2943;
	border: none;
	border-radius: 12px;
	color: #FFFFFF;
	font-size: 16px;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s;
}

.primary-btn:hover {
	background: #1a3d5c;
	transform: translateY(-1px);
}

.text-btn {
	width: 100%;
	height: 48px;
	background: transparent;
	border: none;
	color: #6B7280;
	font-size: 15px;
	font-weight: 500;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	margin-top: 12px;
}

.text-btn:hover {
	color: #374151;
}

/* ===== 品牌 footer ===== */
.footer-brand {
	text-align: center;
	padding: 40px 0;
}

.footer-brand text {
	display: block;
	font-size: 14px;
	font-weight: 600;
	color: #0F2943;
	letter-spacing: 0.5px;
}

.footer-copy {
	font-size: 12px !important;
	font-weight: 400 !important;
	color: #9CA3AF !important;
	margin-top: 4px;
}

.safe-area {
	height: 40px;
}

/* ===== Toast ===== */
.manifold-toast {
	position: fixed;
	top: 80px;
	left: 50%;
	transform: translateX(-50%);
	background: #0F2943;
	padding: 14px 24px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	gap: 10px;
	z-index: 200;
	box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
	animation: slideDown 0.3s ease;
}

.manifold-toast.success {
	background: #10B981;
}

.manifold-toast.error {
	background: #EF4444;
}

.toast-icon {
	font-size: 16px;
}

.toast-text {
	color: #FFFFFF;
	font-size: 14px;
	font-weight: 500;
}

@keyframes slideDown {
	from {
		opacity: 0;
		transform: translateX(-50%) translateY(-10px);
	}
	to {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}
}
</style>
