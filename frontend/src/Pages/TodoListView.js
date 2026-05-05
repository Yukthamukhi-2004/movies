// src/components/TodoListView.js
import React from "react";
import { observer } from "mobx-react-lite"; // Import the observer function
import { useStore } from "../context/StoreContext";

const TodoListView = () => {
  const store = useStore();

  return (
    <div>
      <ul>
        {store.todos.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
};

// Wrap the component here
export default observer(TodoListView);
