<template>
  <div>
    <svg-icon icon-class="question" @click="goto" />
  </div>
</template>

<script setup lang="ts">
const url = ref<string>('https://www.smallpig1997.top/contact')

function goto(): void {
  window.open(url.value)
}
</script>