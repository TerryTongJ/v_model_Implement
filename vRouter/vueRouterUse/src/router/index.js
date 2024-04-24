import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import iKun from "../views/iKun.vue";
import Eggs from "../views/Eggs.vue";
import NotFound from "../views/NotFound.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/iKun", component: iKun },
  { path: "/eggs/:eggType", component: Eggs },
  { path: "/:pathMatch(.*)*", component: NotFound },
];
// 制定路由规则
const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: "active-item",
});

export default router;
