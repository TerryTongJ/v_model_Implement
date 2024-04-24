<template>
  <div>
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/ikun">IKUN</router-link> |
      <router-link
        v-for="dataEgg in dataEggs"
        :key="dataEgg.id"
        :to="`/eggs/${dataEgg.type}`"
      >
        {{ dataEgg.name }} |
      </router-link>
    </nav>
    <router-view> </router-view>
  </div>
</template>

<script>
import dataEggs from "./data.json";
export default {
  data() {
    return {
      dataEggs,
    };
  },
};
</script>

<style scoped>
.active-item {
  color: red;
}
</style>
>
