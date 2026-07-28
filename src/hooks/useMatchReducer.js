import { useReducer } from 'react';
import { demoResumeText, demoJdText, demoResult } from '../data/demoData';

export const ACTION_TYPES = {
  SET_RESUME: 'SET_RESUME',
  SET_JD: 'SET_JD',
  START_MATCH: 'START_MATCH',
  MATCH_SUCCESS: 'MATCH_SUCCESS',
  MATCH_ERROR: 'MATCH_ERROR',
};

const initialState = {
  resumeText: demoResumeText,
  jdText: demoJdText,
  isDemo: true,
  isLoading: false,
  error: null,
  result: demoResult,
  quota: null,
};

function reducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_RESUME:
      return { ...state, resumeText: action.payload };
    case ACTION_TYPES.SET_JD:
      return { ...state, jdText: action.payload };
    case ACTION_TYPES.START_MATCH:
      return { ...state, isLoading: true, error: null };
    case ACTION_TYPES.MATCH_SUCCESS: {
      const { quota, ...result } = action.payload;
      return {
        ...state,
        isLoading: false,
        isDemo: false,
        result,
        quota: quota || state.quota,
        error: null,
      };
    }
    case ACTION_TYPES.MATCH_ERROR:
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}

export function useMatchReducer() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setResume = (text) =>
    dispatch({ type: ACTION_TYPES.SET_RESUME, payload: text });
  const setJd = (text) =>
    dispatch({ type: ACTION_TYPES.SET_JD, payload: text });
  const startMatch = () =>
    dispatch({ type: ACTION_TYPES.START_MATCH });
  const matchSuccess = (result) =>
    dispatch({ type: ACTION_TYPES.MATCH_SUCCESS, payload: result });
  const matchError = (errorMsg) =>
    dispatch({ type: ACTION_TYPES.MATCH_ERROR, payload: errorMsg });

  return { state, setResume, setJd, startMatch, matchSuccess, matchError };
}
