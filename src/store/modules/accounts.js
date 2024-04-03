import { firestore } from "firebase";

const collName = "Accounts";

const accounts = {
  namespaced: true,
  state: {
    accounts: [],
  },
  getters: {
    getAccounts: (state) => {
      return state.accounts;
    },
  },
  mutations: {
    SET_ACCOUNTS(state, accounts) {
      state.accounts = accounts;
    },
    ADD_ACCOUNT(state, account) {
      state.accounts.push(account);
    },
    UPDATE_ACCOUNT(state, payload) {
      Object.assign(state.accounts[payload.index], payload.account);
    },
    REMOVE_ACCOUNT(state, account) {
      const index = state.accounts.indexOf(account);
      state.accounts.splice(index, 1);
    },

    RELOAD_ACCOUNT(state, data) {
      state, data;
      return;
    },
  },
  actions: {
    async addAccount({ commit }, account) {
      const docRef = await firestore()
        .collection(collName)
        .add(account);
      account.id = docRef.id;
      commit("ADD_ACCOUNT", account);
    },
    async loadAccounts({ commit }) {
      const querySnapshot = await firestore()
        .collection(collName)
        .get();
      let account;
      let accounts = querySnapshot.docs.map(function(doc) {
        account = doc.data();
        account.id = doc.id;
        return account;
      });
      commit("SET_ACCOUNTS", accounts);
    },
    async updateAccount({ commit }, payload) {
      await firestore()
        .collection(collName)
        .doc(payload.account.id)
        .set(payload.account);
      commit("UPDATE_ACCOUNT", payload);
    },
    async removeAccount({ commit }, account) {
      await firestore()
        .collection(collName)
        .doc(account.id)
        .delete();
      commit("REMOVE_ACCOUNT", account);
    },

    async getAccount({ commit }, account) {
      commit("RELOAD_ACCOUNT", account);
      let rs;
      await firestore()
        .collection(collName)
        .where("authUid", "==", account.uid)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            rs = doc.data();
          });
        });
      return rs;
    },
  },
};

export default accounts;
