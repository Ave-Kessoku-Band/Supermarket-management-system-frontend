import { defineStore } from 'pinia'
import router from '@/router'

type State = {
  loginTipVisible: boolean
  tipMessage: string
  _timer: number | null

  // New Material Design Toast state
  showToastState: boolean
  toastMessage: string
  toastType: 'success' | 'error' | 'warning' | 'info'
  toastDuration: number
}

export const useUiStore = defineStore('ui', {
  state: (): State => ({
    loginTipVisible: false,
    tipMessage: '',
    _timer: null,

    // New Material Design Toast state
    showToastState: false,
    toastMessage: '',
    toastType: 'info',
    toastDuration: 4000
  }),
  actions: {
    showTip(message = '未登录，请先登录，1 秒后跳转...') {
      this.tipMessage = message
      this.loginTipVisible = true
    },
    hideTip() {
      this.loginTipVisible = false
      this.tipMessage = ''
    },
    hideLoginTip() {
      this.loginTipVisible = false
      this.tipMessage = ''
    },
    promptLoginAndRedirect(redirectPath: string, delay = 1000) {
      // 清理旧定时器
      if (this._timer) {
        clearTimeout(this._timer)
        this._timer = null
      }
      this.showTip()
      this._timer = window.setTimeout(() => {
        this.hideTip()
        router.push({ name: 'login', query: { redirect: redirectPath } })
        this._timer = null
      }, delay)
    },

    // Material Design Toast methods
    showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration?: number) {
      this.toastMessage = message
      this.toastType = type
      this.toastDuration = duration || 4000
      this.showToastState = true
    },

    showSuccessToast(message: string, duration?: number) {
      this.showToast(message, 'success', duration)
    },

    showErrorToast(message: string, duration?: number) {
      this.showToast(message, 'error', duration)
    },

    showWarningToast(message: string, duration?: number) {
      this.showToast(message, 'warning', duration)
    },

    showInfoToast(message: string, duration?: number) {
      this.showToast(message, 'info', duration)
    },

    hideToast() {
      this.showToastState = false
      this.toastMessage = ''
      this.toastType = 'info'
    }
  }
})