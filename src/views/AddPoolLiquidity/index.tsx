import React, { useEffect, useMemo, useState } from 'react'
import {
  TokenAmount,
  STABLE_POOL_ADDRESS,
  STABLES_INDEX_MAP,
  ZERO,
} from '@requiemswap/sdk'
import {
  Button,
  CardBody,
  useMatchBreakpoints,
  Text
} from '@requiemswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { RouteComponentProps, Link } from 'react-router-dom'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { LightCard } from 'components/Card'
import getChain from 'utils/getChain'
import { AutoColumn } from 'components/Layout/Column'
import { DAI, REQT } from 'config/constants/tokens'
import CurrencyInputPanelStable from 'components/CurrencyInputPanel/CurrencyInputPanelStable'
import { AppHeader, AppBody } from 'components/App'
import Row, { RowBetween } from 'components/Layout/Row'
import { ApprovalState, useApproveCallback, useApproveCallbacks } from 'hooks/useApproveCallback'
import useTransactionDeadline from 'hooks/useTransactionDeadline'
import { StablesField } from 'state/mintStables/actions'
import { useGetStablePoolState } from 'hooks/useGetStablePoolState'
import useRefresh from 'hooks/useRefresh'
import { useDerivedMintStablesInfo, useMintStablePoolActionHandlers, useMintStablesActionHandlers, useMintStablesState } from 'state/mintStables/hooks'
import { ButtonStableApprove } from 'components/Button'
import { useTransactionAdder } from 'state/transactions/hooks'
import { useGasPrice, useIsExpertMode, useUserBalances, useUserSlippageTolerance } from 'state/user/hooks'
import { calculateGasMargin, calculateSlippageAmount, getStableRouterContract, getStableSwapContract } from 'utils'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import Dots from 'components/Loader/Dots'

import ConnectWalletButton from 'components/ConnectWalletButton'
import StablePoolPriceBar from './PoolPriceBar'
import Page from '../Page'

export default function AddLiquidityToPool({
  match: {
    params: { chain },
  },
  history,
}: RouteComponentProps<{ chain: string }>) {
  const { account, chainId, library } = useActiveWeb3React("AL")
  const { t } = useTranslation()
  const gasPrice = useGasPrice(chainId)

  useEffect(() => {
    const _chain = chain ?? getChain(chainId)
    history.push(`/${_chain}/add/stables`)

  },
    [chainId, chain, history],
  )

  // modal and loading
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  // txn values
  const deadline = useTransactionDeadline(chainId) // custom from users settings
  const [allowedSlippage] = useUserSlippageTolerance() // custom from users
  const [txHash, setTxHash] = useState<string>('')


  const addTransaction = useTransactionAdder()

  // mint state
  const { values } = useMintStablesState()

  // we separate loading the stablepool to avoid rerendering on every input
  const { slowRefresh } = useRefresh()


  const {
    stablePools,
    stableAmounts,
    // userDataLoaded,
    publicDataLoaded
  } = useGetStablePoolState(chainId, account, slowRefresh, slowRefresh)
  const stablePool = stablePools[0]



  const {
    orderedStableCcyUserBalances,
    parsedStablesAmounts,
    stablesLiquidityMinted,
    stablesPoolTokenPercentage,
    // stablesError,
  } = useDerivedMintStablesInfo(stablePool, publicDataLoaded, stableAmounts, account)

  const { onFieldInput } = useMintStablePoolActionHandlers()

  const tokens = stablePool?.tokens

  const { approvalStates, approveCallback, isLoading } = useApproveCallbacks(
    chainId,
    library,
    account,
    tokens,
    parsedStablesAmounts,
    stablePool?.address,

  )

  const apporvals = approvalStates



  // get the max amounts user can add
  const maxAmountsStables = orderedStableCcyUserBalances?.map(balance => { return maxAmountSpend(chainId, balance) })

  const atMaxAmountsStables = maxAmountsStables?.map((mas, index) => { return mas?.equalTo(parsedStablesAmounts[index] ?? '0') })


  const { isMobile } = useMatchBreakpoints()

  const balances: { [address: string]: TokenAmount } = orderedStableCcyUserBalances ? Object.assign({}, ...orderedStableCcyUserBalances?.map(b => { return { [b?.token.address]: b } })) : {}



  let stableAddValid = false
  let invalidAdd = false
  let apporvalsPending = true
  for (let i = 0; i < parsedStablesAmounts?.length; i++) {
    stableAddValid = stableAddValid || !parsedStablesAmounts[i]?.raw.eq(0)
    invalidAdd = invalidAdd || parsedStablesAmounts[i]?.raw.gt(ZERO)
    apporvalsPending = apporvals[i] === ApprovalState.NOT_APPROVED || apporvals[i] === ApprovalState.PENDING
  }

  const summaryText = useMemo(() => `Add [${parsedStablesAmounts?.map(x => x.toSignificant(8)).join(',')}] of ${parsedStablesAmounts?.map(x => x.token.symbol).join('-')}`,
    [parsedStablesAmounts]
  )

  async function onStablesAdd() {
    if (!chainId || !library || !account) return
    const stableRouter = getStableSwapContract(stablePool, library, account)

    if (invalidAdd && !deadline) {
      return
    }

    const amountMin = calculateSlippageAmount(stablesLiquidityMinted, allowedSlippage)[0]

    const estimate = stableRouter.estimateGas.addLiquidity
    const method = stableRouter.addLiquidity
    const args = [
      parsedStablesAmounts.map(bn => bn.raw.toHexString()),
      amountMin.toString(),
      deadline.toHexString(),
    ]
    const value = null

    setAttemptingTxn(true)
    await estimate(...args, value ? { value } : {})
      .then((estimatedGasLimit) =>
        method(...args, {
          ...(value ? { value } : {}),
          gasLimit: calculateGasMargin(estimatedGasLimit),
          gasPrice,
        }).then((response) => {
          setAttemptingTxn(false)

          addTransaction(response, {
            summary: summaryText,
          })

          setTxHash(response.hash)
        }),
      )
      .catch((err) => {
        setAttemptingTxn(false)
        // we only care if the error is something _other_ than the user rejected the tx
        if (err?.code !== 4001) {
          console.error(err)
        }
      })
  }

  console.log("STABLE APPROVAL", approvalStates)

  const bttm = useMemo(() => { return stablePool?.tokens.length - 1 }, [stablePool])

  return (
    <Page>
      <Row width='200px' height='50px'>
        <Button
          as={Link}
          to={`/${getChain(chainId)}/add/80-${REQT[chainId].address}/20-${DAI[chainId].address}/25`}
          variant="secondary"
          width="100%"
          mb="8px"
        >
          Pairs
        </Button>
        <Button
          as={Link}
          to={`/${getChain(chainId)}/add/stables`}
          variant="primary"
          width="100%"
          mb="8px"
        >
          Stables
        </Button>
      </Row>
      <AppBody>
        <AppHeader
          chainId={chainId}
          account={account}
          title='Add Stablecoin Liquidity'
          subtitle='Receive collateralizable StableSwap LP Tokens'

          helper={t(
            `Liquidity providers earn a ${Number(stablePool?.swapStorage.fee.toString()) / 1e8}% trading fee on all trades made through the pool, proportional to their share of the liquidity pool.`,
          )}
          backTo={`/${getChain(chainId)}/liquidity`}
        />
        <CardBody>

          <AutoColumn gap="5px">
            {
              stablePool && parsedStablesAmounts?.map(((amount, i) => {
                return (
                  <Row align='center'>
                    <CurrencyInputPanelStable
                      chainId={chainId}
                      account={account}
                      width={account && approvalStates[i] !== ApprovalState.APPROVED ? isMobile ? '100px' : '300px' : '100%'}
                      value={values?.[i]}
                      onUserInput={(val) => { return onFieldInput(val, i) }}
                      onMax={() => {
                        onFieldInput(maxAmountsStables[i]?.toExact() ?? '', i)
                      }}
                      showMaxButton={!atMaxAmountsStables[i]}
                      stableCurrency={stablePool.tokens[i]}
                      balances={balances}
                      id="add-liquidity-input-token1"
                      isTop={i === 0}
                      isBottom={i === bttm}
                    />

                    {
                      account && (
                        approvalStates[i] !== ApprovalState.APPROVED && (
                          <ButtonStableApprove
                            onClick={() => approveCallback(i)}
                            disabled={approvalStates[i] === ApprovalState.PENDING}
                            width="75px"
                            marginLeft="5px"
                          >
                            <Text fontSize='12px' color='black'>
                              {approvalStates[i] === ApprovalState.PENDING ? (
                                <Dots>{t('Enabling %asset%', { asset: amount.token.symbol })}</Dots>
                              ) : (
                                !isLoading ? t('Enable %asset%', { asset: amount.token.symbol }) : <Dots>Loading approvals</Dots>
                              )
                              }
                            </Text>
                          </ButtonStableApprove>
                        ))
                    }
                  </Row>

                )
              }))
            }

            <>
              <LightCard padding="0px" borderRadius="20px">
                <LightCard padding="1rem" borderRadius="20px">
                  <StablePoolPriceBar poolTokenPercentage={stablesPoolTokenPercentage} stablePool={stablePool} formattedStablesAmounts={parsedStablesAmounts} />
                </LightCard>
              </LightCard>
            </>

            <AutoColumn gap="md">

              {!account ? (<ConnectWalletButton align='center' maxWidth='100%' />)
                : (apporvalsPending ? (<RowBetween>Approvals still pending...</RowBetween>) :
                  (<Button
                    variant='primary'

                    onClick={() => {
                      onStablesAdd()
                    }}
                    disabled={
                      !stableAddValid
                    }
                  >
                    Supply Stable Liquidity
                  </Button>))}
            </AutoColumn>

          </AutoColumn>

        </CardBody>
      </AppBody>
    </Page>
  )
}
