import { firestore } from "firebase";

const collName = "Police";

const policeStation = {
  namespaced: true,
  state: {
    policeStation: [],
  },
  getters: {
    getPoliceStation: (state) => {
      return state.policeStation;
    },
  },
  mutations: {
    SET_POLICESTATION(state, policeStation) {
      state.policeStation = policeStation;
    },
    ADD_POLICE(state, police) {
      state.policeStation.push(police);
    },
    UPDATE_POLICE(state, payload) {
      Object.assign(state.policeStation[payload.index], payload.police);
    },
    REMOVE_POLICE(state, police) {
      const index = state.policeStation.indexOf(police);
      state.policeStation.splice(index, 1);
    },
  },
  actions: {
    async addPolice({ commit }, police) {
      const docRef = await firestore()
        .collection(collName)
        .add(police);
      police.id = docRef.id;
      commit("ADD_POLICE", police);
    },
    async loadPoliceStation({ commit }) {
      const querySnapshot = await firestore()
        .collection(collName)
        .get();
      let police;
      let policeStation = querySnapshot.docs.map(function(doc) {
        police = doc.data();
        police.id = doc.id;
        return police;
      });
      commit("SET_POLICESTATION", policeStation);
    },
    async updatePolice({ commit }, payload) {
      await firestore()
        .collection(collName)
        .doc(payload.police.id)
        .set(payload.police);
      commit("UPDATE_POLICE", payload);
    },
    async removePolice({ commit }, police) {
      await firestore()
        .collection(collName)
        .doc(police.id)
        .delete();
      commit("REMOVE_POLICE", police);
    },
  },
};

export default policeStation;
