import { firestore } from "firebase";

const collName = "HealthInsurance";

const healthInsuranceStorage = {
  namespaced: true,
  state: {
    healthInsuranceStorage: [],
  },
  getters: {
    getHealthInsuranceStorage: (state) => {
      return state.healthInsuranceStorage;
    },
  },
  mutations: {
    SET_HEALTHINSURANCESTORAGE(state, healthInsuranceStorage) {
      state.healthInsuranceStorage = healthInsuranceStorage;
    },
    ADD_HEALTHINSURANCE(state, healthInsurance) {
      state.healthInsuranceStorage.push(healthInsurance);
    },
    UPDATE_HEALTHINSURANCE(state, payload) {
      Object.assign(
        state.healthInsuranceStorage[payload.index],
        payload.healthInsurance
      );
    },
    REMOVE_HEALTHINSURANCE(state, healthInsurance) {
      const index = state.healthInsuranceStorage.indexOf(healthInsurance);
      state.healthInsuranceStorage.splice(index, 1);
    },

    RELOAD_HEALTHINSURANCE(state, healthInsurance) {
      state, healthInsurance;
      return;
    },
  },
  actions: {
    async addHealthInsurance({ commit }, healthInsurance) {
      const docRef = await firestore()
        .collection(collName)
        .add(healthInsurance);
      healthInsurance.id = docRef.id;
      commit("ADD_HEALTHINSURANCE", healthInsurance);
    },
    async loadHealthInsuranceStorage({ commit }) {
      const querySnapshot = await firestore()
        .collection(collName)
        .get();
      let healthInsurance;
      let healthInsuranceStorage = querySnapshot.docs.map(function(doc) {
        healthInsurance = doc.data();
        healthInsurance.id = doc.id;
        return healthInsurance;
      });
      commit("SET_HEALTHINSURANCESTORAGE", healthInsuranceStorage);
    },
    async updateHealthInsurance({ commit }, payload) {
      await firestore()
        .collection(collName)
        .doc(payload.healthInsurance.id)
        .set(payload.healthInsurance);
      commit("UPDATE_HEALTHINSURANCE", payload);
    },
    async removeHealthInsurance({ commit }, healthInsurance) {
      await firestore()
        .collection(collName)
        .doc(healthInsurance.id)
        .delete();
      commit("REMOVE_HEALTHINSURANCE", healthInsurance);
    },

    async getHealthInsurance({ commit }, healthInsurance) {
      commit("RELOAD_HEALTHINSURANCE", healthInsurance);
      const doc = await firestore()
        .collection(collName)
        .doc(healthInsurance.id)
        .get();
      return doc;
    },
  },
};

export default healthInsuranceStorage;
