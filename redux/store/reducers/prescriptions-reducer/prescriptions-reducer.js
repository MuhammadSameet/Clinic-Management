const initialState = {
  list: [],
  loading: false,
  error: null,
};

const prescriptionsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'PRESCRIPTIONS_LOADING':
      return { ...state, loading: true };
    case 'PRESCRIPTIONS_LOADED':
      return { ...state, loading: false, list: action.payload };
    case 'PRESCRIPTION_ADDED':
      return { ...state, list: [action.payload, ...state.list] };
    case 'PRESCRIPTIONS_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default prescriptionsReducer;
