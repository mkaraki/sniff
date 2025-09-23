<script setup lang="ts">
const logElement = useTemplateRef('log-res');
const downloadableElement = useTemplateRef('downloadable-list');

const clearResults = () => {
  if (logElement.value) logElement.value.innerText = '';
  if (downloadableElement.value) downloadableElement.value.innerHTML = '';
}

defineExpose({
  logElement,
  downloadableElement,
  clearResults,
});
</script>

<template>
  <section>
    <h2>Result</h2>
    <pre><code id="res" ref="log-res"></code></pre>
    <section>
      <h3>Downloadable report</h3>
      <ul id="downloadable-list" ref="downloadable-list"></ul>
    </section>
  </section>

</template>

<style>
.stderr {
  /* This will used by LowerApi for error logging.
   */
  color: red;
}
</style>