import { firestore } from "firebase";

const collName = "Blacklist";

const blacklistStorage = {
  namespaced: true,
  state: {
    blacklistStorage: [],
  },
  getters: {
    getBlacklistStorage: (state) => {
      return state.blacklistStorage;
    },
  },
  mutations: {
    SET_BLACKLISTSTORAGE(state, blacklistStorage) {
      state.blacklistStorage = blacklistStorage;
    },
    ADD_BLACKLIST(state, blacklist) {
      state.blacklistStorage.push(blacklist);
    },
    UPDATE_BLACKLIST(state, payload) {
      Object.assign(state.blacklistStorage[payload.index], payload.blacklist);
    },
    REMOVE_BLACKLIST(state, blacklist) {
      const index = state.blacklistStorage.indexOf(blacklist);
      state.blacklistStorage.splice(index, 1);
    },

    RELOAD_BLACKLIST(state, blacklist) {
      state, blacklist;
      return;
    },
  },
  actions: {
    async addBlacklist({ commit }, blacklist) {
      const docRef = await firestore()
        .collection(collName)
        .add(blacklist);
      blacklist.id = docRef.id;
      commit("ADD_BLACKLIST", blacklist);
    },
    async loadBlacklistStorage({ commit }) {
      const querySnapshot = await firestore()
        .collection(collName)
        .get();
      let blacklist;
      let blacklistStorage = querySnapshot.docs.map(function(doc) {
        blacklist = doc.data();
        blacklist.id = doc.id;
        return blacklist;
      });
      commit("SET_BLACKLISTSTORAGE", blacklistStorage);
    },
    async updateBlacklist({ commit }, payload) {
      await firestore()
        .collection(collName)
        .doc(payload.blacklist.id)
        .set(payload.blacklist);
      commit("UPDATE_BLACKLIST", payload);
    },
    async removeBlacklist({ commit }, blacklist) {
      await firestore()
        .collection(collName)
        .doc(blacklist.id)
        .delete();
      commit("REMOVE_BLACKLIST", blacklist);
    },

    async getBlacklist({ commit }, blacklist) {
      commit("RELOAD_BLACKLIST", blacklist);
      const doc = await firestore()
        .collection(collName)
        .doc(blacklist.id)
        .get();
      return doc;
    },
  },
};

export default blacklistStorage;
