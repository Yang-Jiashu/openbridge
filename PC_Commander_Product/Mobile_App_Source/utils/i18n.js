/**
 * 国际化 (i18n) 工具
 * 支持中英文切换
 */

import zhCN from '../locales/zh-CN.json'
import enUS from '../locales/en-US.json'

const messages = {
	'zh-CN': zhCN,
	'en-US': enUS
}

class I18n {
	constructor() {
		this.locale = uni.getStorageSync('app_locale') || 'zh-CN'
		this.messages = messages
	}

	/**
	 * 设置语言
	 */
	setLocale(locale) {
		if (this.messages[locale]) {
			this.locale = locale
			uni.setStorageSync('app_locale', locale)
			return true
		}
		return false
	}

	/**
	 * 获取当前语言
	 */
	getLocale() {
		return this.locale
	}

	/**
	 * 切换语言
	 */
	toggleLocale() {
		const newLocale = this.locale === 'zh-CN' ? 'en-US' : 'zh-CN'
		this.setLocale(newLocale)
		return newLocale
	}

	/**
	 * 获取翻译文本
	 */
	t(key, defaultValue = '') {
		const keys = key.split('.')
		let value = this.messages[this.locale]
		
		for (const k of keys) {
			if (value && typeof value === 'object' && k in value) {
				value = value[k]
			} else {
				return defaultValue || key
			}
		}
		
		return value || defaultValue || key
	}

	/**
	 * 获取所有支持的语言
	 */
	getSupportedLocales() {
		return [
			{ code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
			{ code: 'en-US', name: 'English', flag: '🇺🇸' }
		]
	}
}

const i18n = new I18n()

export default i18n
export { I18n }
