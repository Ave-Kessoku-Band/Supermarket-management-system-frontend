<template>
  <div class="glass card">
    <div class="section-title">用户管理（员工）</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
      <input class="input" placeholder="姓名/用户名" v-model="search" @keyup.enter="load" style="max-width:240px;" />
      <select class="input" v-model="role" style="max-width:160px;">
        <option value="">全部角色</option>
        <option value="staff">staff</option>
        <option value="admin">admin</option>
      </select>
      <select class="input" v-model="status" style="max-width:160px;">
        <option value="">全部状态</option>
        <option value="ACTIVE">ACTIVE</option>
        <option value="DISABLED">DISABLED</option>
      </select>
      <button class="btn" @click="load">查询</button>
    </div>

    <div style="margin-bottom:12px;">
      <details>
        <summary class="small" style="cursor:pointer;">添加员工</summary>
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
          <input class="input" v-model="form.username" placeholder="用户名" style="max-width:160px;" />
          <input class="input" v-model="form.password" placeholder="初始密码" type="password" style="max-width:160px;" />
          <select class="input" v-model="form.role" style="max-width:160px;">
            <option value="staff">staff</option>
            <option value="admin">admin</option>
          </select>
          <button class="btn" @click="create">创建</button>
        </div>
      </details>
    </div>

    <div v-for="s in staff" :key="s.id" class="glass card" style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-weight:600;">{{ s.username }}（{{ s.role }}）</div>
        <div class="small">状态：{{ s.status }}</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn" @click="toggleStatus(s)">{{ s.status === 'ACTIVE' ? '停用' : '启用' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { apiCreateStaff, apiListStaff, apiSetStaffStatus } from '@/api/endpoints'

const search = ref('')
const role = ref('')
const status = ref('')
const staff = ref<any[]>([])

const load = async () => {
  const res = await apiListStaff({ search: search.value || undefined, role: role.value || undefined, status: status.value || undefined, per_page: 50 })
  staff.value = res.data || []
}
onMounted(load)

const form = reactive({ username: '', password: '', role: 'staff' })
const create = async () => {
  await apiCreateStaff(form)
  Object.assign(form, { username: '', password: '', role: 'staff' })
  await load()
}

const toggleStatus = async (s: any) => {
  const target = s.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
  await apiSetStaffStatus(s.id, target)
  await load()
}
</script>
