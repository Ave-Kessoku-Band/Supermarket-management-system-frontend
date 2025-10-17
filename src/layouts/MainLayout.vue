<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">超市管理（极简）</div>
      <nav>
        <router-link class="nav-link" :class="{active: $route.name==='dashboard'}" to="/">总览
        </router-link>
        <router-link class="nav-link" :class="{active: $route.name==='pos'}" to="/pos">POS 收银
        </router-link>
        <router-link class="nav-link" :class="{active: $route.name==='products'}" to="/products">
          商品管理
        </router-link>
        <router-link class="nav-link" :class="{active: $route.name==='inventory-levels'}"
                     to="/inventory/levels">库存水平
        </router-link>
        <router-link class="nav-link" :class="{active: $route.name==='inventory-adjust'}"
                     to="/inventory/adjust">库存调整
        </router-link>
        <router-link class="nav-link" :class="{active: $route.name==='report-sales'}"
                     to="/reports/sales-summary">销售汇总
        </router-link>
        <router-link class="nav-link" :class="{active: $route.name==='registers'}" to="/registers">
          收银机/班次
        </router-link>
      </nav>
    </aside>
    <section class="content">
      <header class="topbar">
        <div class="spacer"></div>
        <div class="user">
          <span>{{ user?.username }} ({{ user?.role }})</span>
          <button class="btn" @click="onLogout">退出</button>
        </div>
      </header>
      <main class="main">
        <router-view/>
      </main>
    </section>
  </div>
</template>

<script setup lang="ts">
import {useAuthStore} from '../stores/auth'
import {useRouter} from 'vue-router'

const auth = useAuthStore()
const user = auth.user
const router = useRouter()

async function onLogout() {
  await auth.logout()
  router.replace({name: 'login'})
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  background: #fff;
  border-right: 1px solid #eee;
  padding: 12px;
}

.brand {
  font-weight: bold;
  margin-bottom: 12px;
}

.nav-link {
  display: block;
  padding: 8px;
  color: #333;
  text-decoration: none;
  border-radius: 6px;
}

.nav-link.active, .nav-link:hover {
  background: #f0f0f0;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  background: #fff;
}

.spacer {
  flex: 1;
}

.user {
  display: flex;
  gap: 8px;
  align-items: center;
}

.main {
  padding: 12px;
}

.btn {
  padding: 6px 10px;
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
}

.btn:hover {
  background: #f5f5f5;
}
</style>
