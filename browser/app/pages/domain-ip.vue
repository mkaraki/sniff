<script setup lang="ts">
import ResultView from "~/components/result-view.vue";
import {initializeLowerApiBrowser} from "~/lower-api-browser-nuxt";
import {Sniffer} from "../../../shared-js/sniffer";
import type {LowerApi} from "../../../shared-js/lower-api";
const resultViewRef = useTemplateRef('res-view');

const targetRef = ref<string>('');

const btnSearch = useTemplateRef('search');
const btnRecursiveSearch = useTemplateRef('search-recursive');

const extractTarget = (target: string|undefined) => {
  if (target !== undefined) return target;

  return targetRef.value;
}

const lowerApi = ref<LowerApi|undefined>(undefined);
const sniff = ref<Sniffer|undefined>(undefined);

onMounted(() => {
  console.log(resultViewRef?.value?.logElement);
  lowerApi.value = initializeLowerApiBrowser({
    stdoutDom: resultViewRef?.value?.logElement ?? undefined, // ToDo: Add alerting when this become undefined.
    stderrDom: resultViewRef?.value?.logElement ?? undefined,
    dnsOverHttpEndpoint: 'https://cloudflare-dns.com/dns-query',
  });
  sniff.value = new Sniffer(lowerApi.value);
})

const doSearch = async function (target?: string|undefined) {
  target = extractTarget(target);

  if (btnSearch.value) btnSearch.value.disabled = true;
  if (btnRecursiveSearch.value) btnRecursiveSearch.value.disabled = true;

  try {
    if (resultViewRef.value) resultViewRef.value.clearResults();

    await sniff.value?.doSearchOneShot(target);
  }
  finally {
    if (btnSearch.value) btnSearch.value.disabled = false;
    if (btnRecursiveSearch.value) btnRecursiveSearch.value.disabled = false;
  }
}
const doSearchRecursive = async function (target?: string|undefined) {
  target = extractTarget(target);

  if (btnSearch.value) btnSearch.value.disabled = true;
  if (btnRecursiveSearch.value) btnRecursiveSearch.value.disabled = true;

  try {
    if (resultViewRef.value) resultViewRef.value.clearResults();

    await sniff.value?.doRecursiveSearch(target);
  }
  finally {
    if (btnSearch.value) btnSearch.value.disabled = false;
    if (btnRecursiveSearch.value) btnRecursiveSearch.value.disabled = false;
  }

  alert(`Recursive search for ${target} has finished.`);
}
</script>

<template>
  <h1>Domain/IP info</h1>
  <form v-on:submit.prevent>
    <div>
      <label for="domain">Domain/IP</label>
    </div>
    <div>
      <input type="text" id="domain" v-model="targetRef" />
    </div>
    <div>
      <button id="search" ref="search" v-on:click.prevent="doSearch();">Search</button>
    </div>
  </form>
  <div>
    <button id="search-recursive" ref="search-recursive" v-on:click.prevent="doSearchRecursive();">Search Recursive</button>
  </div>
  <div>
    Examples:
    <ul>
      <li><a href="javascript:void(0)" v-on:click="doSearch('google.com')">google.com</a></li>
      <li><a href="javascript:void(0)" v-on:click="doSearch('1.1.1.1')">1.1.1.1</a></li>
    </ul>
  </div>
  <result-view ref="res-view" />
</template>

<style scoped>

</style>