import { firestore } from "firebase";

const collName = "Vouchers";

const vouchers = {
  namespaced: true,
  state: {
    vouchers: [],
  },
  getters: {
    getVouchers: (state) => {
      return state.vouchers;
    },
  },
  mutations: {
    SET_VOUCHERS(state, vouchers) {
      state.vouchers = vouchers;
    },
    ADD_VOUCHER(state, voucher) {
      state.vouchers.push(voucher);
    },
    UPDATE_VOUCHER(state, payload) {
      Object.assign(state.vouchers[payload.index], payload.voucher);
    },
    REMOVE_VOUCHER(state, voucher) {
      const index = state.vouchers.indexOf(voucher);
      state.vouchers.splice(index, 1);
    },

    RELOAD_VOUCHER(state, voucher) {
      state, voucher;
      return;
    },
  },
  actions: {
    async addVoucher({ commit }, voucher) {
      const docRef = await firestore()
        .collection(collName)
        .add(voucher);
      voucher.id = docRef.id;
      commit("ADD_VOUCHER", voucher);
    },
    async loadVouchers({ commit }) {
      const querySnapshot = await firestore()
        .collection(collName)
        .get();
      let voucher;
      let vouchers = querySnapshot.docs.map(function(doc) {
        voucher = doc.data();
        voucher.id = doc.id;
        return voucher;
      });
      commit("SET_VOUCHERS", vouchers);
    },
    async updateVoucher({ commit }, payload) {
      await firestore()
        .collection(collName)
        .doc(payload.voucher.id)
        .set(payload.voucher);
      commit("UPDATE_VOUCHER", payload);
    },
    async removeVoucher({ commit }, voucher) {
      await firestore()
        .collection(collName)
        .doc(voucher.id)
        .delete();
      commit("REMOVE_VOUCHER", voucher);
    },

    async getVoucher({ commit }, voucher) {
      commit("RELOAD_VOUCHER", voucher);
      const doc = await firestore()
        .collection(collName)
        .doc(voucher.id)
        .get();
      return doc;
    },
  },
};

export default vouchers;
