<template>
	<view class="container">
		<view class="form-item">
			<text class="label">PC Server 地址</text>
			<input class="input" type="text" v-model="serverUrl" placeholder="例如 http://192.168.1.5:8000" />
			<text class="tip">如果是局域网，请输入电脑 IP (如 192.168.x.x)。</text>
			<text class="tip">如果是外网，请输入 Ngrok 地址 (如 https://xxx.ngrok.io)。</text>
		</view>

		<button class="save-btn" @click="saveSettings">保存</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				serverUrl: ''
			}
		},
		onShow() {
			this.serverUrl = uni.getStorageSync('server_url') || '';
		},
		methods: {
			saveSettings() {
				let url = this.serverUrl.trim();
				if (!url) {
					uni.showToast({
						title: '请输入地址',
						icon: 'none'
					});
					return;
				}
				
				// 自动补全 http
				if (!url.startsWith('http')) {
					url = 'http://' + url;
				}
				// 去除结尾斜杠
				if (url.endsWith('/')) {
					url = url.slice(0, -1);
				}

				uni.setStorageSync('server_url', url);
				uni.showToast({
					title: '保存成功',
					icon: 'success'
				});
				
				setTimeout(() => {
					uni.navigateBack();
				}, 1000);
			}
		}
	}
</script>

<style>
	.container {
		padding: 20px;
		background-color: #1e1e1e;
		min-height: 100vh;
	}

	.form-item {
		margin-bottom: 30px;
	}

	.label {
		display: block;
		color: #e5e5e5;
		font-size: 16px;
		margin-bottom: 10px;
	}

	.input {
		background-color: #2d2d2d;
		color: white;
		height: 46px;
		padding: 0 15px;
		border-radius: 8px;
		font-size: 16px;
	}

	.tip {
		display: block;
		color: #888;
		font-size: 12px;
		margin-top: 8px;
	}

	.save-btn {
		background-color: #3b82f6;
		color: white;
		border-radius: 25px;
	}
</style>
