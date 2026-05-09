<script setup lang="ts">
defineProps<{
  modelValue?: string
  placeholder?: string
  required?: boolean
  id?: string
  name?: string
  rows?: number
}>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <textarea
    :id="id"
    :name="name"
    :rows="rows ?? 4"
    :placeholder="placeholder"
    :required="required"
    :value="modelValue"
    class="w-full px-3 py-2.5 text-[13px] bg-surface border border-border rounded-[var(--radius-md)] focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors resize-y min-h-[70px]"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>
