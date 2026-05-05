// store/TodoStore.js
import { makeAutoObservable } from "mobx";

class TodoStore {
  todos = [];

  constructor() {
    makeAutoObservable(this); // Automatically manages observables and actions
  }

  addTodo(text) {
    this.todos.push({ text, id: Date.now() });
  }
}

export const todoStore = new TodoStore();
