import { configureStore } from "@reduxjs/toolkit";
import prediction from "./slices/prediction";

const store = configureStore({
  reducer: {
    prediction,
  },
});

export default store;
