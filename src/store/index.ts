import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, type Storage } from "redux-persist";
import authReducer from "./slices/authSlice";

// Vite 8's dependency pre-bundler double-wraps redux-persist/lib/storage's
// CJS default export (itself already interop-wrapped), so `storage.getItem`
// ends up undefined at runtime. Sidestepping the package's storage engine
// entirely avoids the interop mismatch — this is all createWebStorage does.
const storage: Storage = {
  getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
  setItem: (key, value) => Promise.resolve(window.localStorage.setItem(key, value)),
  removeItem: (key) => Promise.resolve(window.localStorage.removeItem(key)),
};

const persistConfig = {
  key: "uptrend-admin-root",
  storage,
  whitelist: ["auth"],
};

const rootReducer = combineReducers({ auth: authReducer });
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
  devTools: true,
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
