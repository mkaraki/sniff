<script setup lang="ts">
</script>

<template class="tmpl">
  <div>
    <h1>Sniff Tools</h1>
    <ul>
      <li><NuxtLink to="/domain-ip">Domain/IP Info</NuxtLink></li>
      <li><NuxtLink to="/mail">Mail interest parser</NuxtLink></li>
    </ul>
  </div>
</template>

<style scoped>
.tmpl {
  display: flex;
  width: 100vw;
  justify-content: center;
  align-items: center;
}
div {
  max-width: 200px;
}
ul {
  list-style: none;
}
li {
  display: block;
  width: 100%;
  height: 20px;
  font-size: 18px;
  text-align: center;

  margin: 5px;
  padding: 5px;
  border-radius: 5px;
  background-color: #aad;
}
</style>