import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage/index.js";
import authReducer from "./slices/authSlice";
import productReducer from "./slices/productSlice";
import orderReducer from "./slices/orderSlice";

const storageEngine = storage.default || storage;

const persistConfig = {
  key: "root",
  version: 1,
  storage: storageEngine,
};

const rootReducer = combineReducers({
  auth: authReducer,
  products: productReducer,
  orders: orderReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
