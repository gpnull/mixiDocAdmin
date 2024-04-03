import { projectAuth, secondaryApp } from "@/main.js";

const auth = {
  namespaced: true,
  state: {
    user: {
      loggedIn: false,
      data: null,
    },
  },
  getters: {
    user: (state) => {
      return state.user;
    },
  },
  mutations: {
    SET_LOGGED_IN(state, value) {
      state.user.loggedIn = value;
    },
    SET_USER(state, data) {
      state.user.data = data;
    },

    RELOAD_USER(state, data) {
      state, data;
      return;
    },
  },
  actions: {
    fetchUser({ commit }, user) {
      commit("SET_LOGGED_IN", user !== null);
      if (user) {
        commit("SET_USER", user);
      } else {
        commit("SET_USER", null);
      }
    },

    async signUp({ commit }, data) {
      commit("RELOAD_USER", data);
      try {
        const response = await secondaryApp
          .auth()
          .createUserWithEmailAndPassword(data.email, data.password);
        if (!response) throw new Error("Could not create a new user!");

        await response.user.updateProfile({ displayName: data.fullName });
        console.log(response);
        secondaryApp.auth().signOut();
        return response;
      } catch (err) {
        console.log(err);
      }
    },

    async sendEmailresetPassword({ commit }, data) {
      commit("RELOAD_USER", data);
      try {
        await projectAuth.sendPasswordResetEmail(data.email);
      } catch (err) {
        console.log(err);
      }
    },
  },
};

export default auth;
