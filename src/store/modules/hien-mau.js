import { firestore } from "firebase";

const collName = "BloodStorage";

const bloodstorage = {
  namespaced: true,
  state: {
    bloodstorage: [],
  },
  getters: {
    getBloodStorage: (state) => {
      return state.bloodstorage;
    },
  },
  mutations: {
    SET_BLOODSTORAGE(state, bloodstorage) {
      state.bloodstorage = bloodstorage;
    },
    ADD_BLOOD(state, blood) {
      state.bloodstorage.push(blood);
    },
    UPDATE_BLOOD(state, payload) {
      Object.assign(state.bloodstorage[payload.index], payload.blood);
    },
    REMOVE_BLOOD(state, blood) {
      const index = state.bloodstorage.indexOf(blood);
      state.bloodstorage.splice(index, 1);
    },

    SET_BLOOD(state, blood) {
      state, blood;
      return;
    },
  },
  actions: {
    async addBlood({ commit }, blood) {
      const docRef = await firestore()
        .collection(collName)
        .add(blood);
      blood.id = docRef.id;
      commit("ADD_BLOOD", blood);
    },
    async loadBloodStorage({ commit }) {
      const querySnapshot = await firestore()
        .collection(collName)
        .get();
      let blood;
      let bloodstorage = querySnapshot.docs.map(function(doc) {
        blood = doc.data();
        blood.id = doc.id;
        return blood;
      });
      commit("SET_BLOODSTORAGE", bloodstorage);
    },
    async updateBlood({ commit }, payload) {
      await firestore()
        .collection(collName)
        .doc(payload.blood.id)
        .set(payload.blood);
      commit("UPDATE_BLOOD", payload);
    },
    async removeBlood({ commit }, blood) {
      await firestore()
        .collection(collName)
        .doc(blood.id)
        .delete();
      commit("REMOVE_BLOOD", blood);
    },

    async getBlood({ commit }, blood) {
      commit("SET_BLOOD", blood);
      const doc = await firestore()
        .collection(collName)
        .doc(blood.id)
        .get();
      return doc;
    },
  },
};

export default bloodstorage;
