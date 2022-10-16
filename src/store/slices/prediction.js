import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  prediction: null,
};

const predictionSlice = createSlice({
  name: "prediction",
  initialState,
  reducers: {
    setPrediction: (state, action) => {
      state.prediction = action.payload;
    },
  },
});

export const { setPrediction } = predictionSlice.actions;
export default predictionSlice.reducer;
