import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles.css'

// Vuetify配置
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import { md3 } from 'vuetify/blueprints'

const vuetify = createVuetify({
  components,
  directives,
  blueprint: md3,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#6750A4',
          secondary: '#625B71',
          tertiary: '#7D5260',
          surface: '#FFFBFE',
          background: '#FFFBFE',
          error: '#BA1A1A',
          'on-primary': '#FFFFFF',
          'on-secondary': '#FFFFFF',
          'on-tertiary': '#FFFFFF',
          'on-surface': '#1C1B1F',
          'on-background': '#1C1B1F',
          'on-error': '#FFFFFF',
          'surface-variant': '#E7E0EC',
          'on-surface-variant': '#49454F',
          'outline': '#79747E',
        }
      },
      dark: {
        colors: {
          primary: '#D0BCFF',
          secondary: '#CCC2DC',
          tertiary: '#EFB8C8',
          surface: '#141218',
          background: '#141218',
          error: '#FFB4AB',
          'on-primary': '#381E72',
          'on-secondary': '#332D41',
          'on-tertiary': '#492532',
          'on-surface': '#E6E0E9',
          'on-background': '#E6E0E9',
          'on-error': '#690005',
          'surface-variant': '#49454F',
          'on-surface-variant': '#CAC4D0',
          'outline': '#938F99',
        }
      }
    }
  }
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(vuetify)
app.mount('#app')
