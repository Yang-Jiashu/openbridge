<template>
	<view class="launch-container">
		<!-- 动态背景 -->
		<view class="bg-animated">
			<view class="circle circle-1"></view>
			<view class="circle circle-2"></view>
			<view class="circle circle-3"></view>
		</view>

		<!-- 主内容 -->
		<view class="content" :class="{ 'fade-out': isLeaving }">
			<view class="logo-wrapper">
				<view class="logo">
					<text class="logo-icon">🖥️</text>
				</view>
				<view class="logo-ring ring-1"></view>
				<view class="logo-ring ring-2"></view>
			</view>

			<view class="brand">
				<text class="app-name">PC Commander</text>
				<text class="tagline">远程控制，触手可及</text>
			</view>

			<view class="loading-bar">
				<view class="progress" :style="{ width: progress + '%' }"></view>
			</view>

			<view class="status-text">
				<text>{{ statusText }}</text>
			</view>
		</view>

		<!-- 底部版权 -->
		<view class="footer" :class="{ 'fade-out': isLeaving }">
			<text class="version">v1.0.0</text>
			<text class="copyright">Powered by OpenCode</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				progress: 0,
				statusText: '正在初始化...',
				isLeaving: false
			}
		},
		onLoad() {
			this.startLoading();
		},
		methods: {
			startLoading() {
				const steps = [
					{ progress: 20, text: '正在检查配置...', delay: 300 },
					{ progress: 50, text: '正在连接服务器...', delay: 600 },
					{ progress: 80, text: '正在加载界面...', delay: 900 },
					{ progress: 100, text: '准备就绪', delay: 1200 }
				];

				steps.forEach((step, index) => {
					setTimeout(() => {
						this.progress = step.progress;
						this.statusText = step.text;

						if (index === steps.length - 1) {
							setTimeout(() => {
								this.enterApp();
							}, 400);
						}
					}, step.delay);
				});
			},
			enterApp() {
				this.isLeaving = true;
				setTimeout(() => {
					const serverUrl = uni.getStorageSync('server_url');
					if (!serverUrl) {
						uni.redirectTo({ url: '/pages/settings/settings' });
					} else {
						uni.switchTab({ url: '/pages/index/index' });
					}
				}, 500);
			}
		}
	}
</script>

<style>
	.launch-container {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, #1a1f3a 0%, #0d1225 50%, #1a0f2e 100%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	/* 动态背景 */
	.bg-animated {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		overflow: hidden;
	}

	.circle {
		position: absolute;
		border-radius: 50%;
		filter: blur(60px);
		opacity: 0.5;
	}

	.circle-1 {
		width: 300px;
		height: 300px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		top: -100px;
		right: -100px;
		animation: float 8s ease-in-out infinite;
	}

	.circle-2 {
		width: 250px;
		height: 250px;
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		bottom: -80px;
		left: -80px;
		animation: float 10s ease-in-out infinite reverse;
	}

	.circle-3 {
		width: 200px;
		height: 200px;
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		animation: pulse 6s ease-in-out infinite;
	}

	@keyframes float {
		0%, 100% { transform: translate(0, 0) scale(1); }
		50% { transform: translate(30px, 30px) scale(1.1); }
	}

	@keyframes pulse {
		0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
		50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.5; }
	}

	/* 主内容 */
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		z-index: 10;
		transition: all 0.5s ease;
	}

	.content.fade-out {
		opacity: 0;
		transform: scale(0.9);
	}

	/* Logo */
	.logo-wrapper {
		position: relative;
		width: 120px;
		height: 120px;
		margin-bottom: 40px;
	}

	.logo {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 10px 40px rgba(102, 126, 234, 0.5);
		position: relative;
		z-index: 10;
		animation: logoPulse 2s ease-in-out infinite;
	}

	@keyframes logoPulse {
		0%, 100% { transform: scale(1); box-shadow: 0 10px 40px rgba(102, 126, 234, 0.5); }
		50% { transform: scale(1.05); box-shadow: 0 15px 50px rgba(102, 126, 234, 0.7); }
	}

	.logo-icon {
		font-size: 56px;
	}

	.logo-ring {
		position: absolute;
		border: 2px solid rgba(102, 126, 234, 0.3);
		border-radius: 50%;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.ring-1 {
		width: 140px;
		height: 140px;
		animation: ringExpand 2s ease-out infinite;
	}

	.ring-2 {
		width: 160px;
		height: 160px;
		animation: ringExpand 2s ease-out infinite 0.5s;
	}

	@keyframes ringExpand {
		0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
		100% { transform: translate(-50%, -50%) scale(1.3); opacity: 0; }
	}

	/* 品牌信息 */
	.brand {
		text-align: center;
		margin-bottom: 50px;
	}

	.app-name {
		display: block;
		color: #ffffff;
		font-size: 28px;
		font-weight: 700;
		letter-spacing: 1px;
		margin-bottom: 10px;
	}

	.tagline {
		display: block;
		color: rgba(255, 255, 255, 0.6);
		font-size: 14px;
		letter-spacing: 2px;
	}

	/* 加载条 */
	.loading-bar {
		width: 200px;
		height: 4px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 2px;
		overflow: hidden;
		margin-bottom: 20px;
	}

	.progress {
		height: 100%;
		background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
		border-radius: 2px;
		transition: width 0.3s ease;
		box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
	}

	/* 状态文字 */
	.status-text {
		text-align: center;
	}

	.status-text text {
		color: rgba(255, 255, 255, 0.5);
		font-size: 13px;
		letter-spacing: 1px;
	}

	/* 底部 */
	.footer {
		position: absolute;
		bottom: 40px;
		left: 0;
		right: 0;
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 8px;
		transition: all 0.5s ease;
	}

	.footer.fade-out {
		opacity: 0;
	}

	.version {
		color: rgba(255, 255, 255, 0.4);
		font-size: 12px;
	}

	.copyright {
		color: rgba(255, 255, 255, 0.3);
		font-size: 11px;
	}
</style>
