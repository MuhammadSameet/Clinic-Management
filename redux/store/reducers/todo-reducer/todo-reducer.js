// Todo reducer slices are defined here...!

import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    todoList: []
};

const todoSlice = createSlice({
    name: "todo",
    initialState: initialState,
    reducers: {
        ADD_TODO: (state, action) => {
            const { payload: { todoInput } } = action;
            console.log('Payload: ', todoInput);

            const todoListClone = [...state.todoList];
            todoListClone.push(todoInput);
            state.todoList = todoListClone;
        }
    }
});

export const { ADD_TODO } = todoSlice.actions;
export default todoSlice.reducer;
