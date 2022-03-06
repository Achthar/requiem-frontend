/** eslint no-empty-interface: 0 */
import { createAsyncThunk } from '@reduxjs/toolkit'
import { BigNumber } from 'ethers'
import { getAddress } from 'ethers/lib/utils';
import multicall from 'utils/multicall';
import pairFactoryABI from 'config/abi/avax/RequiemWeightedPairFactory.json'
import { TokenPair } from 'config/constants/types';
import { getAllTokenPairs } from 'config/constants/tokenPairs';
import { Fraction, JSBI, WEIGHTED_FACTORY_ADDRESS } from '@requiemswap/sdk';
import { WeightedPairMetaData } from '../types'


interface MetaRequestData {
  chainId: number
  tokenPairs?: TokenPair[]
}

// checks whether this specific token pair is new
export const isNewTokenPair = (additionalTokenPair: TokenPair, referenceTokens: TokenPair[]): boolean => {
  let pairNew = false
  for (let j = 0; j < referenceTokens.length; j++) {
    if (additionalTokenPair.token0.address !== referenceTokens[j].token0.address &&
      additionalTokenPair.token1.address !== referenceTokens[j].token1.address) {
      pairNew = true
      break;
    }
  }
  return pairNew
}




interface WeightedPairMetaResponse {
  metaData: { [pastedAddresses: string]: WeightedPairMetaData[] }
  currentPairs: TokenPair[]
}
// for a provided list of token pairs the funcktion returns a dictionary with the addresses of the
// tokens in the pairs as keys and arrays of addresses as values
export const fetchWeightedPairMetaData = createAsyncThunk(
  "weightedPairs/fetchWeightedPairMetaData",
  async ({ chainId, tokenPairs }: MetaRequestData): Promise<WeightedPairMetaResponse> => {
    // const tokenPairs = cleanTokenPairs(tokenPairs, getAllTokenPairs(chainId))
    console.log("WP: INPUT Meta", tokenPairs,)
    // // cals for existing pool addresses
    const calls = tokenPairs.map(pair => {
      return {
        address: getAddress(WEIGHTED_FACTORY_ADDRESS[chainId]),
        name: 'getPairs',
        params: [getAddress(pair.token0.address), getAddress(pair.token1.address)]
      }
    })

    const rawMetaData = await multicall(chainId, pairFactoryABI, calls)

    const existingPairs = rawMetaData.map((entry, index) => entry._tokenPairs.length > 0 ? index : -1).filter((index) => index > -1)

    console.log("WP: RAWMETA", rawMetaData, existingPairs)
    return {
      metaData: Object.assign(
        {}, ...existingPairs.map(
          (index) =>
          (
            {
              [`${getAddress(tokenPairs[index].token0.address)}-${getAddress(tokenPairs[index].token1.address)}`]:
                rawMetaData[index]._tokenPairs.map((addr) => ({ address: addr, token0: tokenPairs[index].token0, token1: tokenPairs[index].token1 }))
            }
          )
        )
      ),
      currentPairs: tokenPairs
    }

  }
);