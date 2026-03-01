const initialState = {
  list: [],
  loading: false,
  error: null,
};

const patientsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'PATIENTS_LOADING':
      return { ...state, loading: true };
    case 'PATIENTS_LOADED':
      return { ...state, loading: false, list: action.payload };
    case 'PATIENT_ADDED':
      return { ...state, list: [action.payload, ...state.list] };
    case 'PATIENT_UPDATED':
      return {
        ...state,
        list: state.list.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'PATIENT_DELETED':
      return {
        ...state,
        list: state.list.filter(p => p.id !== action.payload),
      };
    case 'PATIENTS_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default patientsReducer;
