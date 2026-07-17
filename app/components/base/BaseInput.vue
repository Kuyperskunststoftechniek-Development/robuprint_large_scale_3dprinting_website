<script setup lang="ts">
defineProps<{
  modelValue?: string
  type?: string
  placeholder?: string
  required?: boolean
  id?: string
  name?: string
  autocomplete?: string
  maxlength?: number | string
}>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <input
    :id="id"
    :name="name"
    :type="type ?? 'text'"
    :placeholder="placeholder"
    :required="required"
    :value="modelValue"
    :autocomplete="autocomplete"
    :maxlength="maxlength"
    class="w-full px-3 py-2.5 text-[13px] bg-surface border border-border rounded-[var(--radius-md)] placeholder:text-text-muted/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
