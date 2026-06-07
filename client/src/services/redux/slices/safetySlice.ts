import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    sosActive: false,
    emergencyContacts: [] as any[],
    incidents: [] as any[],
    heatmapData: [] as any[],
};

const safetySlice = createSlice({
    name: "safety",
    initialState,
    reducers: {
        setSosActive: (state, action) => {
            state.sosActive = action.payload;
        },
        setEmergencyContacts: (state, action) => {
            state.emergencyContacts = action.payload;
        },
        setIncidents: (state, action) => {
            state.incidents = action.payload;
        },
        setHeatmapData: (state, action) => {
            state.heatmapData = action.payload;
        },
    },
});

export const { setSosActive, setEmergencyContacts, setIncidents, setHeatmapData } = safetySlice.actions;
export default safetySlice.reducer;
