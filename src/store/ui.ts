import { defineStore } from 'pinia'
import router from '@/router'

type State = {
  loginTipVisible: boolean
  tipMessage: string
  _timer: number | null
}

export const useUiStore = defineStore('ui', {
  state: (): State => ({
    loginTipVisible: false,
    tipMessage: '',
    _timer: null
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
    }
  }
})
