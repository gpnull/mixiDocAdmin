import Vue from "vue";
import App from "./App.vue";
import * as firebase from "firebase";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import { firestorePlugin } from "vuefire";

Vue.config.productionTip = false;

Vue.use(firestorePlugin);

const configOptions = {
  apiKey: "AIzaSyCeFjJ99Gm2Yz0ZoB_VbS1zyWUzsHcQYRQ",
  authDomain: "gp-i-money.firebaseapp.com",
  projectId: "gp-i-money",
  storageBucket: "gp-i-money.appspot.com",
  messagingSenderId: "985079797010",
  appId: "1:985079797010:web:a32b7fe1f464db740c8fcb",
};

firebase.initializeApp(configOptions);
const secondaryApp = firebase.initializeApp(configOptions, "Secondary");

let app;

firebase.auth().onAuthStateChanged((user) => {
  store.dispatch("auth/fetchUser", user);
  if (!app) {
    new Vue({
      store,
      router,
      vuetify,
      render: (h) => h(App),
    }).$mount("#app");
  }
});

const projectAuth = firebase.auth();
export { projectAuth, secondaryApp };
