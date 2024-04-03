import { firestore } from "firebase";

const collName = "Logger";

const logs = {
  namespaced: true,
  state: {
    logs: [],
  },
  getters: {
    getLogs: (state) => {
      return state.logs;
    },
  },
  mutations: {
    SET_LOGS(state, logs) {
      state.logs = logs;
    },
    ADD_LOG(state, log) {
      state.logs.push(log);
    },
    REMOVE_LOG(state, log) {
      const index = state.logs.indexOf(log);
      state.logs.splice(index, 1);
    },
  },
  actions: {
    async addLog({ commit }, log) {
      // console.log(log);
      // commit("ADD_LOG", log);
      // return;
      const docRef = await firestore()
        .collection(collName)
        .add(log);
      log.id = docRef.id;
      commit("ADD_LOG", log);
    },
    async loadLogs({ commit }) {
      const querySnapshot = await firestore()
        .collection(collName)
        .get();
      let log;
      let logs = querySnapshot.docs.map(function(doc) {
        log = doc.data();
        log.id = doc.id;
        return log;
      });
      commit("SET_LOGS", logs);
    },
    async removeLog({ commit }, log) {
      await firestore()
        .collection(collName)
        .doc(log.id)
        .delete();
      commit("REMOVE_LOG", log);
    },
  },
};

export default logs;
