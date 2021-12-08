/* eslint-disable */
import React, { Fragment, memo } from 'react'
import { TradeV4, PoolType } from '@requiemswap/sdk'
import { Text, Flex, ChevronRightIcon } from '@requiemswap/uikit'
import { unwrappedToken } from 'utils/wrappedCurrency'
import { CurrencyLogo } from 'components/Logo'
import { AutoColumn } from 'components/Column'
import Row from 'components/Row'

export default memo(function SwapV3Route({ trade }: { trade: TradeV4 }) {
  return (
    // <AutoColumn style={{ flex: '1' }} gap='2px' >
    <Flex flexWrap="wrap" width="100%" justifyContent="flex-end" alignItems="center">
      {trade.route.path.map((currency, j) => {
        const isLastItem: boolean = j === trade.route.pools.length - 1
        return (
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={j}>
            <Flex alignItems="end">
              <AutoColumn style={{ flex: '1' }} gap='2px' >
                <Row>
                  <Flex alignItems="end">
                    <AutoColumn style={{ flex: '1' }} gap='2px' >
                      <CurrencyLogo chainId={trade.route.chainId} currency={currency} size='17px' style={{ marginLeft: "0.125rem", marginRight: "0.125rem" }} />
                      <Text fontSize="7px" ml="0.125rem" mr="0.125rem">
                        {currency.symbol}
                      </Text>
                    </AutoColumn>
                  </Flex>
                  {!isLastItem && <ChevronRightIcon width="12px" />}
                </Row>

                {!isLastItem && trade.route.pools[j] && (<Text fontSize="10px" textAlign='center'>
                  {trade.route.pools[j].type === PoolType.StablePairWrapper ? 'Quad' : 'Pairs'}
                </Text>)}
              </AutoColumn>
            </Flex>
          </Fragment>
        )
      })}
    </Flex>
    // </AutoColumn>
  )
})
