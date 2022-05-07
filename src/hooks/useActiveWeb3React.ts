import { useEffect, useState, useRef } from 'react'

import { Web3Provider } from '@ethersproject/providers'
import { simpleRpcProvider } from 'utils/providers'
import { useNetworkState } from 'state/globalNetwork/hooks'
import { useWeb3React } from '@web3-react/core'
// eslint-disable-next-line import/no-unresolved
import { Web3ReactContextInterface } from '@web3-react/core/dist/types'
import { useChainIdHandling } from './useChainIdHandle'

/**
 * Provides a web3 provider with or without user's signer
 * Recreate web3 instance only if the provider change
 */
const useActiveWeb3React = (id?: string): Web3ReactContextInterface<Web3Provider> => {
  const { library, chainId: chainIdWeb3, ...web3React } = useWeb3React()

  useChainIdHandling(chainIdWeb3, web3React.account)
  const { chainId } = useNetworkState()

  const refEth = useRef(library)
  console.log(id)
  const [provider, setprovider] = useState(library || simpleRpcProvider(chainId, `useActiveWeb3React ${id}`))

  useEffect(() => {
    if (library !== refEth.current) {
      console.log("library !== refEth.current")
      setprovider(library || simpleRpcProvider(chainId, `useActiveWeb3React`))
      refEth.current = library
    }
  }, [chainId, library])

  return { library: provider, chainId, ...web3React }
}

export default useActiveWeb3React
