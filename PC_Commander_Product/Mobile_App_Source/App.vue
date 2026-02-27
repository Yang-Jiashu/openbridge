<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			// 应用启动逻辑已在 launch 页面处理
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
	/* 全局样式 */
	page {
		background-color: #0d1225;
		color: #ffffff;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	}

	/* 滚动条样式 */
	::-webkit-scrollbar {
		width: 0;
		height: 0;
		background: transparent;
	}

	/* 按钮点击效果 */
	button::after {
		border: none;
	}

	/* 输入框样式重置 */
	input, textarea {
		outline: none;
	}

	/* 安全区域适配 */
	.safe-area-top {
		padding-top: var(--status-bar-height);
	}

	.safe-area-bottom {
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
	}

	/* 动画工具类 */
	.fade-in {
		animation: fadeIn 0.3s ease;
	}

	.fade-out {
		animation: fadeOut 0.3s ease;
	}

	.slide-up {
		animation: slideUp 0.5s ease;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes fadeOut {
		from { opacity: 1; }
		to { opacity: 0; }
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* 脉冲动画 */
	.pulse {
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.05); }
	}

	/* 旋转动画 */
	.spin {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	/* 弹跳动画 */
	.bounce {
		animation: bounce 1s ease infinite;
	}

	@keyframes bounce {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-10px); }
	}
</style>
