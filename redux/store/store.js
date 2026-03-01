// Main store file...!

import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducers/reducer";

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [],
            ignoredPaths: []
        }
    })
});

export default store;
