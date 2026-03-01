const initialState = {
  list: [],
  loading: false,
  error: null,
};

const appointmentsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'APPOINTMENTS_LOADING':
      return { ...state, loading: true };
    case 'APPOINTMENTS_LOADED':
      return { ...state, loading: false, list: action.payload };
    case 'APPOINTMENT_ADDED':
      return { ...state, list: [action.payload, ...state.list] };
    case 'APPOINTMENT_STATUS_UPDATED':
      return {
        ...state,
        list: state.list.map(a =>
          a.id === action.payload.id
            ? { ...a, status: action.payload.status }
            : a
        ),
      };
    case 'APPOINTMENTS_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default appointmentsReducer;
