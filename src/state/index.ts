import { configureStore } from '@reduxjs/toolkit'
import { save, load } from 'redux-localstorage-simple'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import application from './application/reducer'
import blockReducer from './block'
import votingReducer from './voting'
import { updateVersion } from './global/actions'
import user from './user/reducer'
import transactions from './transactions/reducer'
import swapV3 from './swapV3/reducer'
import bondReducer from './bonds'
import globalNetwork from './globalNetwork/reducer'
import mintStables from './mintStables/reducer'
import mintWeightedPair from './mintWeightedPair/reducer'
import lists from './lists/reducer'
import burn from './burn/reducer'
import burnStables from './burnStables/reducer'
import multicall from './multicall/reducer'
import userBalances from './userBalances/reducer'

const PERSISTED_KEYS: string[] = ['user', 'transactions', 'lists']

const store = configureStore({
  devTools: process.env.NODE_ENV !== 'production',
  reducer: {
    globalNetwork,
    application,
    block: blockReducer,
    bonds: bondReducer,
    voting: votingReducer,
    userBalances,
 
    // Exchange
    user,
    transactions,
    swapV3,
    mintStables,
    mintWeightedPair,
    burn,
    burnStables,
    multicall,
    lists,
  },
  middleware: (getDefaultMiddleware) => [...getDefaultMiddleware({ thunk: true }), save({ states: PERSISTED_KEYS })],
  preloadedState: load({ states: PERSISTED_KEYS }),
})

store.dispatch(updateVersion())

/**
 * @see https://redux-toolkit.js.org/usage/usage-with-typescript#getting-the-dispatch-type
 */
export type AppDispatch = typeof store.dispatch
export type AppState = ReturnType<typeof store.getState>
export const useAppDispatch = () => useDispatch()
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector


export default store