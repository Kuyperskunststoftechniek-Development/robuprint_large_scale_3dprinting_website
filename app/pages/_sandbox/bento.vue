<script setup lang="ts">
import { onMounted } from 'vue'
const { observeAll } = useReveal()
onMounted(() => observeAll())
definePageMeta({ layout: false })
</script>

<template>
  <div class="max-w-[1200px] mx-auto px-6 py-12">
    <h1 class="text-2xl font-bold mb-6">Bento sandbox</h1>

    <BentoGrid>
      <BentoTile :span="3" variant="dark" eyebrow="Build envelope">
        <h2 class="text-5xl font-extrabold tracking-tight">4×4×8</h2>
        <p class="font-mono text-[10px] text-[#9aa3b0]">METER (W × D × H) — 128 m³</p>
        <template #illustration><SchemIllustration name="envelope" class="w-44 h-44 text-[#7CA1FF]" /></template>
      </BentoTile>

      <BentoTile :span="3" variant="accent" eyebrow="Print + post-mill">
        <h2 class="text-2xl font-bold">Dezelfde robot frees de finish strak na.</h2>
        <template #illustration><SchemIllustration name="robot-arm" class="w-24 h-24 text-white" /></template>
      </BentoTile>

      <BentoTile :span="2" eyebrow="Materialen"><h2 class="font-bold">HDPE & PP</h2></BentoTile>
      <BentoTile :span="2" eyebrow="Circulair"><h2 class="font-bold">Eigen recyclaat</h2></BentoTile>
      <BentoTile :span="2" variant="muted" eyebrow="Process">
        <h2 class="font-bold">Layer voor layer</h2>
        <template #illustration><SchemIllustration name="layer-stack" class="w-32 h-32 text-accent" /></template>
      </BentoTile>

      <BentoTile :span="6" to="/projecten" eyebrow="Recente projecten">
        <h2 class="text-2xl font-bold">Wat we voor anderen hebben gemaakt.</h2>
      </BentoTile>
    </BentoGrid>
  </div>
</template>
