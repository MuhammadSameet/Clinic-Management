// All todo actions functins ae defined here...!

import { ADD_TODO } from "../../reducers/todo-reducer/todo-reducer";

const addTodoAction = (todoVal) => {
    return (dispatch) => {
        // console.log('Todo val: ', todoVal);

        dispatch({
            type: ADD_TODO,
            payload: {
                todoInput: todoVal,
            }
        });
    };
};

export { addTodoAction };
