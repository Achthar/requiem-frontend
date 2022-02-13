import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from 'state'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from 'utils/bigNumber'
import { getBalanceAmount } from 'utils/formatBalance'
import { bonds as bondList } from 'config/constants/bonds'
import { useWeightedPairs, WeightedPairState } from 'hooks/useWeightedPairs'
import { Price, TokenAmount } from '@requiemswap/sdk'
import { DAI, REQT } from 'config/constants/tokens'
import useRefresh from 'hooks/useRefresh'
import { simpleRpcProvider } from 'utils/providers'
import { BondType } from 'config/constants/types'
import { calcSingleBondStableLpDetails } from './calcSingleBondStableLpDetails'
import { fetchBondUserDataAsync, nonArchivedBonds } from '.'
import { State, Bond, BondsState } from '../types'
import { calcSingleBondDetails } from './calcSingleBondDetails'


export const usePollBondsPublicData = (chainId: number, includeArchive = false) => {
  const dispatch = useAppDispatch()
  const { slowRefresh } = useRefresh()

  useEffect(() => {
    const bondsToFetch = includeArchive ? bondList(chainId) : nonArchivedBonds(chainId ?? 43113)
    console.log(bondsToFetch)
    const bondIds = bondsToFetch.map((bondToFetch) => bondToFetch.bondId)
    // dispatch(fetchBondsPublicDataAsync())
  }, [
    includeArchive,
    //  dispatch, 
    slowRefresh, chainId])
}

export const usePollBondsWithUserData = (chainId: number, includeArchive = false) => {
  const dispatch = useAppDispatch()
  const { slowRefresh } = useRefresh()
  const { account, library } = useWeb3React()

  useEffect(() => {
    const bondsToFetch = bondList(chainId)
    const bondIds = bondsToFetch.map((bondToFetch) => bondToFetch.bondId)

    bondsToFetch.map(
      (bond) => {
        if (bond.type === BondType.PairLP) {
          dispatch(calcSingleBondDetails({ bond, provider: library ?? simpleRpcProvider(chainId ?? 43113), chainId: chainId ?? 43113 }))
        }
        if (bond.type === BondType.StableSwapLP) {
          dispatch(calcSingleBondStableLpDetails({ bond, provider: library ?? simpleRpcProvider(chainId ?? 43113), chainId: chainId ?? 43113 }))
        }
        return 0
      }
    )

    if (account) {
      dispatch(fetchBondUserDataAsync({ chainId, account, bondIds }))
    }
  }, [chainId, includeArchive,
    dispatch,
    library,
    slowRefresh, account])
}

/**
 * Fetches the "core" bond data used globally
 */

export const useBonds = (): BondsState => {
  const bonds = useSelector((state: State) => state.bonds)
  return bonds
}

export const useBondFromBondId = (bondId): Bond => {

  const bond = useSelector((state: State) => state.bonds.bondData[bondId])
  return bond
}

export const useBondFromBondName = (name: string): Bond => {
  const bond = useSelector((state: State) => state.bonds.data.find((f) => f.name === name))
  return bond
}

export const useBondUser = (bondId) => {
  const bond = useBondFromBondId(bondId)
  if (bond) {
    return {
      allowance: bond.userData ? new BigNumber(bond.userData.allowance) : BIG_ZERO,
      tokenBalance: bond.userData ? new BigNumber(bond.userData.tokenBalance) : BIG_ZERO,
      stakedBalance: bond.userData ? new BigNumber(bond.userData.stakedBalance) : BIG_ZERO,
      earnings: bond.userData ? new BigNumber(bond.userData.earnings) : BIG_ZERO,
    }
  }

  return {
    allowance: BIG_ZERO,
    tokenBalance: BIG_ZERO,
    stakedBalance: BIG_ZERO,
    earnings: BIG_ZERO,
  }
}

// Return the base token price for a bond, from a given bondId
export const useUsdPriceFromBondId = (bondId: number): BigNumber => {
  const bond = useBondFromBondId(bondId)
  return bond && new BigNumber(12) // new BigNumber(bond.token.busdPrice)
}

export const useLpTokenPrice = (symbol: string) => {
  const bond = useBondFromBondName(symbol)
  const bondTokenPriceInUsd = useUsdPriceFromBondId(bond.bondId)
  let lpTokenPrice = BIG_ZERO

  if (bond.lpTotalSupply && bond.lpTotalInQuoteToken) {
    // Total value of base token in LP
    const valueOfBaseTokenInBond = bondTokenPriceInUsd.times(bond.tokenAmountTotal)
    // Double it to get overall value in LP
    const overallValueOfAllTokensInBond = valueOfBaseTokenInBond.times(2)
    // Divide total value of all tokens, by the number of LP tokens
    const totalLpTokens = getBalanceAmount(new BigNumber(bond.lpTotalSupply))
    lpTokenPrice = overallValueOfAllTokensInBond.div(totalLpTokens)
  }

  return lpTokenPrice
}

// /!\ Deprecated , use the BUSD hook in /hooks

export const usePriceNetworkCCYUsd = (): BigNumber => {
  const bnbUsdBond = useBondFromBondId(1)
  return new BigNumber(3243) // new BigNumber(bnbUsdBond.quoteToken.busdPrice)
}

export const usePriceReqtUsd = (chainId: number): BigNumber => {
  // const reqtnetworkCCYBond = useBondFromBondId(0)
  const [pairState, pair] = useWeightedPairs(chainId, [[REQT[chainId], DAI[chainId]]], [80], [25])[0]

  return useMemo(
    () => {
      const inAmount = new TokenAmount(REQT[chainId ?? 43113], '1000000000000000000')

      const [outAmount,] = pairState === WeightedPairState.EXISTS
        ? pair.clone().getOutputAmount(inAmount)
        : [new TokenAmount(DAI[chainId ?? 43113], '1'),]
      return new BigNumber(outAmount.raw.toString()) // reqtnetworkCCYBond.token.busdPrice
    },
    [chainId, pair, pairState]
  )
}


export const usePriceNetworkDollar = (): BigNumber => {
  const networkDollarBond = useBondFromBondId(1)
  return new BigNumber(806) // new BigNumber(networkDollarBond.quoteToken.busdPrice)
}


export const usePriceRequiemDollar = (): BigNumber => {
  const requiemDollarBond = useBondFromBondId(251)

  const requiemPriceDollarAsString = '1.321' // requiemDollarBond.token.busdPrice

  const reqtPriceUsd = useMemo(() => {
    return new BigNumber(requiemPriceDollarAsString)
  }, [requiemPriceDollarAsString])

  return reqtPriceUsd
}