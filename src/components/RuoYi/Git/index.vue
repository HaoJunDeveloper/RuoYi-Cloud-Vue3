<template>
  <div>
    <svg-icon icon-class="github" @click="goto" />
  </div>
</template>

<script setup lang="ts">
const url = ref<string>('https://www.smallpig1997.top/')

function goto(): void {
  window.open(url.value)
}
</script>
