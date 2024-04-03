import { firestore } from "firebase";

const collName = "Newbies";

const newbies = {
  namespaced: true,
  state: {
    newbies: [],
  },
  getters: {
    getNewbies: (state) => {
      return state.newbies;
    },
  },
  mutations: {
    SET_NEWBIES(state, newbies) {
      state.newbies = newbies;
    },
    ADD_NEWBIE(state, newbie) {
      state.newbies.push(newbie);
    },
    UPDATE_NEWBIE(state, payload) {
      Object.assign(state.newbies[payload.index], payload.newbie);
    },
    REMOVE_NEWBIE(state, newbie) {
      const index = state.newbies.indexOf(newbie);
      state.newbies.splice(index, 1);
    },
  },
  actions: {
    async addNewbie({ commit }, newbie) {
      const docRef = await firestore()
        .collection(collName)
        .add(newbie);
      newbie.id = docRef.id;
      commit("ADD_NEWBIE", newbie);
    },
    async loadNewbies({ commit }) {
      const querySnapshot = await firestore()
        .collection(collName)
        .get();
      let newbie;
      let newbies = querySnapshot.docs.map(function(doc) {
        newbie = doc.data();
        newbie.id = doc.id;
        return newbie;
      });
      commit("SET_NEWBIES", newbies);
    },
    async updateNewbie({ commit }, payload) {
      await firestore()
        .collection(collName)
        .doc(payload.newbie.id)
        .set(payload.newbie);
      commit("UPDATE_NEWBIE", payload);
    },
    async removeNewbie({ commit }, newbie) {
      await firestore()
        .collection(collName)
        .doc(newbie.id)
        .delete();
      commit("REMOVE_NEWBIE", newbie);
    },
  },
};

export default newbies;
