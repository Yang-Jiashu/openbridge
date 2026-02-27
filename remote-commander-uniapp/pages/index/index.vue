<template>
	<view class="container">
		<view class="header">
			<text class="title">PC Commander</text>
			<view class="settings-btn" @click="goToSettings">⚙️</view>
		</view>

		<scroll-view class="chat-area" scroll-y="true" :scroll-top="scrollTop" scroll-with-animation="true">
			<view class="message-list">
				<view v-for="(msg, index) in messages" :key="index" :class="['message-item', msg.role === 'user' ? 'user' : 'ai']">
					<view class="bubble">
						<text>{{ msg.content }}</text>
					</view>
				</view>
				<view v-if="loading" class="message-item ai">
					<view class="bubble loading">
						<text>Thinking...</text>
					</view>
				</view>
			</view>
		</scroll-view>

		<view class="input-area">
			<input class="input-box" type="text" v-model="inputText" placeholder="输入指令..." confirm-type="send" @confirm="sendMessage" />
			<button class="send-btn" @click="sendMessage">发送</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				inputText: '',
				messages: [{
					role: 'ai',
					content: 'OpenCode Agent 已连接。请下达指令。'
				}],
				loading: false,
				scrollTop: 0,
				serverUrl: ''
			}
		},
		onShow() {
			this.serverUrl = uni.getStorageSync('server_url');
			if (!this.serverUrl) {
				uni.navigateTo({
					url: '/pages/settings/settings'
				});
			}
		},
		methods: {
			goToSettings() {
				uni.navigateTo({
					url: '/pages/settings/settings'
				});
			},
			async sendMessage() {
				if (!this.inputText.trim()) return;

				const text = this.inputText;
				this.messages.push({
					role: 'user',
					content: text
				});
				this.inputText = '';
				this.scrollToBottom();
				this.loading = true;

				try {
					// 拼接 API 地址
					let apiUrl = this.serverUrl;
					if (!apiUrl.endsWith('/')) apiUrl += '/';
					apiUrl += 'api/chat';

					const res = await uni.request({
						url: apiUrl,
						method: 'POST',
						data: {
							message: text
						},
						header: {
							'content-type': 'application/json'
						}
					});

					this.loading = false;

					if (res.statusCode === 200) {
						this.messages.push({
							role: 'ai',
							content: res.data.response
						});
					} else {
						this.messages.push({
							role: 'ai',
							content: 'Error: 服务器返回 ' + res.statusCode
						});
					}

				} catch (e) {
					this.loading = false;
					this.messages.push({
						role: 'ai',
						content: '网络错误: 无法连接到 PC。\n请检查 IP 设置或网络连接。\n' + e.errMsg
					});
				}
				
				this.scrollToBottom();
			},
			scrollToBottom() {
				setTimeout(() => {
					this.scrollTop = 999999;
				}, 100);
			}
		}
	}
</script>

<style>
	.container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #1e1e1e;
	}

	.header {
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #000000;
		position: relative;
		padding-top: var(--status-bar-height);
	}

	.title {
		color: white;
		font-size: 16px;
		font-weight: bold;
	}

	.settings-btn {
		position: absolute;
		right: 15px;
		color: white;
		font-size: 20px;
		padding: 5px;
	}

	.chat-area {
		flex: 1;
		background-color: #1e1e1e;
		overflow: hidden;
	}

	.message-list {
		padding: 15px;
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	.message-item {
		display: flex;
		width: 100%;
	}

	.message-item.user {
		justify-content: flex-end;
	}

	.message-item.ai {
		justify-content: flex-start;
	}

	.bubble {
		max-width: 80%;
		padding: 10px 15px;
		border-radius: 18px;
		font-size: 15px;
		line-height: 1.5;
		word-break: break-all;
	}

	.user .bubble {
		background-color: #3b82f6;
		color: white;
		border-bottom-right-radius: 4px;
	}

	.ai .bubble {
		background-color: #3e3e3e;
		color: #e5e5e5;
		border-bottom-left-radius: 4px;
	}
	
	.loading {
		color: #888;
		font-style: italic;
	}

	.input-area {
		background-color: #2d2d2d;
		padding: 10px 15px;
		padding-bottom: calc(10px + constant(safe-area-inset-bottom));
		padding-bottom: calc(10px + env(safe-area-inset-bottom));
		display: flex;
		align-items: center;
		gap: 10px;
		border-top: 1px solid #333;
	}

	.input-box {
		flex: 1;
		background-color: #3e3e3e;
		color: white;
		height: 40px;
		border-radius: 20px;
		padding: 0 15px;
	}

	.send-btn {
		background-color: #3b82f6;
		color: white;
		font-size: 14px;
		height: 40px;
		line-height: 40px;
		border-radius: 20px;
		padding: 0 20px;
	}
</style>
