import { firestore } from "firebase";

const collName = "Expenses";

const expenses = {
  namespaced: true,
  state: {
    expenses: [],
  },
  getters: {
    getExpenses: (state) => {
      return state.expenses;
    },
  },
  mutations: {
    SET_EXPENSES(state, expenses) {
      state.expenses = expenses;
    },
    ADD_EXPENSE(state, expense) {
      state.expenses.push(expense);
    },
    UPDATE_EXPENSE(state, payload) {
      Object.assign(state.expenses[payload.index], payload.expense);
    },
    REMOVE_EXPENSE(state, expense) {
      const index = state.expenses.indexOf(expense);
      state.expenses.splice(index, 1);
    },
  },
  actions: {
    async addExpense({ commit }, expense) {
      const docRef = await firestore()
        .collection(collName)
        .add(expense);
      expense.id = docRef.id;
      commit("ADD_EXPENSE", expense);
    },
    async loadExpenses({ commit }) {
      const querySnapshot = await firestore()
        .collection(collName)
        .get();
      let expense;
      let expenses = querySnapshot.docs.map(function(doc) {
        expense = doc.data();
        expense.id = doc.id;
        return expense;
      });
      commit("SET_EXPENSES", expenses);
    },
    async updateExpense({ commit }, payload) {
      await firestore()
        .collection(collName)
        .doc(payload.expense.id)
        .set(payload.expense);
      commit("UPDATE_EXPENSE", payload);
    },
    async removeExpense({ commit }, expense) {
      await firestore()
        .collection(collName)
        .doc(expense.id)
        .delete();
      commit("REMOVE_EXPENSE", expense);
    },
  },
};

export default expenses;
