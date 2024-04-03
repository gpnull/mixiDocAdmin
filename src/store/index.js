import Vue from "vue";
import Vuex from "vuex";
import auth from "./modules/auth";
import bloodstorage from "./modules/hien-mau";
import expenses from "./modules/sao-ke-khoan-chi";
import allstatus from "./modules/status";
import policeStation from "./modules/ho-so-canh-sat";
import newbies from "./modules/cu-dan-moi";
import logs from "./modules/logger";
import accounts from "./modules/accounts";
import vouchers from "./modules/vouchers";
import healthInsuranceStorage from "./modules/bao-hiem-y-te";
import blacklistStorage from "./modules/danh-sach-den";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    auth,
    bloodstorage,
    expenses,
    allstatus,
    policeStation,
    newbies,
    logs,
    accounts,
    vouchers,
    healthInsuranceStorage,
    blacklistStorage,
  },
});
