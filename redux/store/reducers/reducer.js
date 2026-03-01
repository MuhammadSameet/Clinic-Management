// Main reducer file...!

import { combineReducers } from "redux";
import todoReducer from "./todo-reducer/todo-reducer";
import authReducer from "./auth-reducer/auth-reducer";

// Patients reducer
const patientsReducer = (state = { list: [], loading: false, error: null }, action) => {
  switch (action.type) {
    case 'PATIENTS_LOADING':
      return { ...state, loading: true };
    case 'PATIENTS_LOADED':
      return { ...state, loading: false, list: action.payload };
    case 'PATIENTS_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Appointments reducer
const appointmentsReducer = (state = { list: [], loading: false, error: null }, action) => {
  switch (action.type) {
    case 'APPOINTMENTS_LOADING':
      return { ...state, loading: true };
    case 'APPOINTMENTS_LOADED':
      return { ...state, loading: false, list: action.payload };
    case 'APPOINTMENTS_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Prescriptions reducer
const prescriptionsReducer = (state = { list: [], loading: false, error: null }, action) => {
  switch (action.type) {
    case 'PRESCRIPTIONS_LOADING':
      return { ...state, loading: true };
    case 'PRESCRIPTIONS_LOADED':
      return { ...state, loading: false, list: action.payload };
    case 'PRESCRIPTIONS_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  todoStates: todoReducer,
  authStates: authReducer,
  patientsStates: patientsReducer,
  appointmentsStates: appointmentsReducer,
  prescriptionsStates: prescriptionsReducer,
});

export default rootReducer;
