<script setup lang="ts">
defineProps<{
  modelValue?: string
  placeholder?: string
  required?: boolean
  id?: string
  name?: string
  rows?: number
  maxlength?: number | string
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
    :maxlength="maxlength"
    class="w-full px-3 py-2.5 text-[13px] bg-surface border border-border rounded-[var(--radius-md)] placeholder:text-text-muted/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors resize-y min-h-[70px]"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>
