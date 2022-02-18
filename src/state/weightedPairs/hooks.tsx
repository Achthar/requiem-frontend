import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { BigNumber } from 'ethers'
import { JSBI, Price, StablePool, STABLES_LP_TOKEN, SwapStorage, Token, TokenAmount, WeightedPair } from '@requiemswap/sdk'
import { BondType, SerializedToken, TokenPair } from 'config/constants/types'
import { deserializeToken } from 'state/user/hooks/helpers'
import { STABLE_POOL_LP } from 'config/constants/tokens'
import { State, Bond, BondsState, StablePoolsState, WeightedPairState, SerializedWeightedPair } from '../types'

/**
 * Fetches the whole state
 */

export const useWeightedPairsState = (): WeightedPairState => {
  const pairState = useSelector((state: State) => state.weightedPairs)
  return pairState
}


export const deserializeWeightedPair = (tokenPair: TokenPair, pair: SerializedWeightedPair) => {
  if (!pair) return undefined
  return new WeightedPair(
    new TokenAmount(
      new Token(
        tokenPair.token0.chainId,
        tokenPair.token0.address,
        tokenPair.token0.decimals,
        tokenPair.token0.symbol,
        tokenPair.token0.name
      ),
      JSBI.BigInt(pair.reserve0)
    ),
    new TokenAmount(
      new Token(
        tokenPair.token1.chainId,
        tokenPair.token1.address,
        tokenPair.token1.decimals,
        tokenPair.token1.symbol,
        tokenPair.token1.name
      ),
      JSBI.BigInt(pair.reserve1)
    ),
    JSBI.BigInt(pair.weight0),
    JSBI.BigInt(pair.fee)
  )
}

// returns all pairs as SDK Pair object
// requires everything to be loaded, otherwise the result
// will be an empty array
export const useDeserializedWeightedPairs = (): WeightedPair[] => {
  const pairState = useSelector((state: State) => state.weightedPairs)
  if (!pairState.metaDataLoaded || !pairState.reservesAndWeightsLoaded)
    return []

  let rawPairs = []
  const keys = Object.keys(pairState.weightedPairs)
  for (let i = 0; i < keys.length; i++)
    rawPairs = [...rawPairs, ...Object.values(pairState.weightedPairs[keys[i]])]

  return rawPairs.map(pair => deserializeWeightedPair(null, pair)
  )
}


// returns all pairs as SDK Pair object
// requires everything to be loaded, otherwise the result
// will be an empty array
export const useDeserializedWeightedPairsAndLpBalances = (): { pairs: WeightedPair[], balances: TokenAmount[], totalSupply: TokenAmount[] } => {
  const pairState = useSelector((state: State) => state.weightedPairs)
  if (!pairState.metaDataLoaded || !pairState.reservesAndWeightsLoaded || !pairState.userBalancesLoaded)
    return { pairs: [], balances: [], totalSupply: [] }
  console.log("WP PS", pairState)
  let rawPairs = []
  let rawTokens = []
  const keys = Object.keys(pairState.weightedPairs).sort()
  for (let i = 0; i < keys.length; i++) {
    rawPairs = [...rawPairs, ...Object.values(pairState.weightedPairs[keys[i]])]
    rawTokens = [...rawTokens, ...Object.values(pairState.weightedPairs[keys[i]]).map((_, j) =>
      pairState.tokenPairs.find(x => x.token0.address === keys[i].split('-')[0] && x.token1.address === keys[i].split('-')[1])
    )]
  }

  const chainId = pairState.referenceChain
  return {
    pairs: rawPairs.map((pair, index) => deserializeWeightedPair({ token0: rawTokens[index].token0, token1: rawTokens[index].token1 }, pair)),
    balances: rawPairs.map(pair => new TokenAmount(new Token(chainId, pair.address, 18, ``, 'RLP'), pair.userData?.balance ?? '0')),
    totalSupply: rawPairs.map(pair => new TokenAmount(new Token(chainId, pair.address, 18, ``, 'RLP'), pair?.totalSupply ?? '0'))
  }

}

function generateTokenDict(serializedTokens: SerializedToken[]): { [id: number]: Token } {
  return Object.assign({},
    ...Object.values(serializedTokens).map(
      (x, index) => ({ [index]: new Token(x.chainId, x.address, x.decimals, x.symbol, x.name) })
    )
  )
}

export const useStablePoolLpBalance = (id: number) => {
  const { pools } = useSelector((state: State) => state.stablePools)
  const lpToken = pools[id]?.lpToken ? deserializeToken(pools[id]?.lpToken) : STABLE_POOL_LP[43113] // fallback
  return new TokenAmount(lpToken, pools[id]?.userData?.lpBalance ?? '0')
}

export const useDeserializedStablePools = (): StablePool[] => {
  const { pools, publicDataLoaded: dataLoaded } = useSelector((state: State) => state.stablePools)

  const currentBlock = useSelector((state: State) => state.block.currentBlock)

  if (!dataLoaded)
    return []

  return pools.map(pool => new StablePool(
    generateTokenDict(pool.tokens),
    pool.balances.map(balance => BigNumber.from(balance ?? '0')),
    BigNumber.from(pool.A),
    new SwapStorage(
      pool.swapStorage.tokenMultipliers.map(m => BigNumber.from(m)),
      BigNumber.from(pool.swapStorage.fee),
      BigNumber.from(pool.swapStorage.adminFee),
      BigNumber.from(pool.swapStorage.initialA),
      BigNumber.from(pool.swapStorage.futureA),
      BigNumber.from(pool.swapStorage.initialATime),
      BigNumber.from(pool.swapStorage.futureATime),
      pool.swapStorage.lpAddress
    ),
    currentBlock,
    BigNumber.from(pool.lpTotalSupply),
    BigNumber.from(0)
  )
  )
}
