<script setup lang="ts">
defineProps<{
  modelValue?: string
  id?: string
  name?: string
  required?: boolean
  options: Array<{ value: string; label: string }>
}>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <select
    :id="id"
    :name="name"
    :required="required"
    :value="modelValue"
    class="w-full px-3 py-2.5 text-[13px] bg-surface border border-border rounded-[var(--radius-md)] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
  </select>
</template>
