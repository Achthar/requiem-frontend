/* eslint no-useless-return: 0 */
import React, { useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { Text, Flex, CardBody, Card } from '@requiemswap/uikit'

import { useDispatch } from 'react-redux'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import Column from 'components/Column'
import TokenPositionCard from 'components/PositionCard/TokenPosition'
import {
  useTokenBalancesWithLoadingIndicator,
  useNetworkCCYBalances,
  getStables,
  getMainTokens,
  getTokenAmounts,
  getStableAmounts,
  getMainAmounts
} from '../../state/userBalances/hooks'
// import { useTokenBalancesWithLoadingIndicator as xD } from '../../state/wallet/hooks'
import {
  refreshBalances,
  refreshNetworkCcyBalance,
  setBalanceLoadingState
} from '../../state/userBalances/actions'
import Dots from '../../components/Loader/Dots'
import { AppDispatch } from '../../state'

const Body = styled(CardBody)`
  background-color: ${({ theme }) => theme.colors.dropdownDeep};
`

export const BodyWrapper = styled(Card)`
  border-radius: 24px;
  max-width: 2000px;
  width: 100%;
  z-index: 1;
  align:center;
`

export default function Balances() {
  const { account, chainId } = useActiveWeb3React()

  const networkCcyBalance = useNetworkCCYBalances(chainId, [account])[account]
  const [
    allBalances,
    fetchingAllBalances
  ] = useTokenBalancesWithLoadingIndicator(
    account,
    [...getMainTokens(chainId), ...getStables(chainId)]
  )

  const dispatch = useDispatch<AppDispatch>()

  useEffect(
    () => {
      dispatch(refreshBalances({
        newBalances: allBalances
      }))
      return;
    },
    [allBalances, dispatch]
  )

  useEffect(
    () => {
      dispatch(refreshNetworkCcyBalance({
        newBalance: networkCcyBalance
      }))
      return;
    },
    [networkCcyBalance, dispatch]
  )

  useEffect(
    () => {
      dispatch(setBalanceLoadingState({
        newIsLoading: fetchingAllBalances
      }))
      return;
    },
    [fetchingAllBalances, dispatch]
  )

  // const amounts = useMemo(() =>
  //   getTokenAmounts(chainId, allBalances),
  //   [chainId, allBalances]
  // )
  const stableAmounts = useMemo(() =>
    getStableAmounts(chainId, allBalances),
    [chainId, allBalances]
  )

  const mainAmounts = useMemo(() =>
    getMainAmounts(chainId, allBalances),
    [chainId, allBalances]
  )

  const renderBody = () => {
    if (!account) {
      return (
        <Text color="textSubtle" textAlign="center">
          Connect to a wallet to view your balances.
        </Text>
      )
    }
    if (fetchingAllBalances) {
      return (
        <Text color="textSubtle" textAlign="center">
          <Dots>Loading</Dots>
        </Text>
      )
    }
    return (
      <div style={{ zIndex: 15 }}>
        <Flex flexDirection="row" justifyContent='space-between' alignItems="center" grid-row-gap='10px' marginRight='10px' marginLeft='10px'>
          <Column>
            {!fetchingAllBalances && mainAmounts.map((tokenAmount, index) => (
              <TokenPositionCard
                tokenAmount={tokenAmount}
                mb={index < Object.values(allBalances).length - 1 ? '5px' : 0}
                gap='1px'
                padding='0px'
                showSymbol
              />))}
          </Column>
          <Column>
            {!fetchingAllBalances && stableAmounts.slice(0, 2).map((tokenAmount, index) => (
              <TokenPositionCard
                tokenAmount={tokenAmount}
                mb={index < Object.values(allBalances).length - 1 ? '5px' : 0}
                gap='1px'
                padding='0px'
                showSymbol
              />))}
          </Column>
          <Column>
            {!fetchingAllBalances && stableAmounts.slice(2, 4).map((tokenAmount, index) => (
              <TokenPositionCard
                tokenAmount={tokenAmount}
                mb={index < Object.values(allBalances).length - 1 ? '5px' : 0}
                gap='1px'
                padding='0px'
                showSymbol
              />))}
          </Column>
        </Flex >
      </div>
    )
  }





  return (
    <>
      {/* <BodyWrapper> */}
      {/* <AppHeader title='Your Liquidity' subtitle='Remove liquidity to receive tokens back' /> */}
      {/* <Body> */}
      {renderBody()}
      {/* {account && (
            <Flex flexDirection="column" alignItems="center" mt="24px">
              <Button id="import-pool-link" variant="secondary" scale="sm" as={Link} to="/find">
                Find other tokens
              </Button>
            </Flex>
          )} */}
      {/* </Body> */}
      {/* </BodyWrapper> */}
    </>
  )
}
