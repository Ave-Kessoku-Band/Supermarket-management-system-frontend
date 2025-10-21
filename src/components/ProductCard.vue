<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
  category: string
  unit: string
  price: number
  image?: string
  stock?: number
  stockStatus?: 'OK' | 'LOW' | 'OUT'
  disabled?: boolean
}>()

const stockStatusLabel = computed(() => {
  if (props.stockStatus === 'OUT') return '无库存'
  if (props.stockStatus === 'LOW') return '库存紧张'
  return '有货'
})
const statusColor = computed(() => {
  if (props.stockStatus === 'OUT') return '#d92d20'  // red-600
  if (props.stockStatus === 'LOW') return '#f79009'  // amber-500
  return '#12b76a'                                   // green-600
})
</script>
