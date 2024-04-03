import Vue from "vue";
import VueRouter from "vue-router";
import firebase from "firebase";
import Login from "../views/Login";

import Dashboard from "../views/admin/Dashboard";
import Categories from "../views/admin/Categories";
import Sounds from "../views/admin/Sounds";

import HienMau from "../views/admin/hien-mau";
import SaoKeKhoanChi from "../views/admin/sao-ke-khoan-chi";
import SaoKeCanhSat from "../views/admin/sao-ke-canh-sat";
import CuDanMoi from "../views/admin/cu-dan-moi";
import Logger from "../views/admin/logger";
import Accounts from "../views/admin/accounts";
import Vouchers from "../views/admin/vouchers";
import BaoHiemYTe from "../views/admin/bao-hiem-y-te";
import BlacklistStorage from "../views/admin/danh-sach-den";

Vue.use(VueRouter);

const routes = [
  {
    // Login Page
    path: "/",
    component: Login,
  },
  {
    path: "/mixi",
    component: () => import("../views/admin/AdminHome.vue"),
    children: [
      { path: "", component: Dashboard },
      { path: "sounds", component: Sounds },
      { path: "categories", component: Categories },
      { path: "hien-mau", component: HienMau },
      { path: "khoan-chi", component: SaoKeKhoanChi },
      { path: "canh-sat", component: SaoKeCanhSat },
      { path: "cu-dan-moi", component: CuDanMoi },
      { path: "danh-sach-den", component: BlacklistStorage },
      { path: "logger", component: Logger },
      { path: "accounts", component: Accounts },
      { path: "vouchers", component: Vouchers },
      { path: "bao-hiem-y-te", component: BaoHiemYTe },
    ],
    meta: {
      requiresAuth: true,
    },
  },
];

const router = new VueRouter({
  mode: "history",
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!firebase.auth().currentUser) {
      next({ name: "/" });
    } else {
      next();
    }
  } else if (to.path == "/") {
    if (firebase.auth().currentUser) {
      next({ path: "/mixi" });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
