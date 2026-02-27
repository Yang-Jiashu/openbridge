<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			// 检查是否已配置服务器地址
			const serverUrl = uni.getStorageSync('server_url');
			if (!serverUrl) {
				// 如果没有配置，跳转到设置页
				uni.reLaunch({
					url: '/pages/settings/settings'
				});
			}
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	body {
		background-color: #1e1e1e;
		color: #e5e5e5;
	}
</style>
