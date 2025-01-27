import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import React, { useCallback, useMemo, useState } from 'react'
import { Flex, Text, Button, Modal, LinkExternal } from '@requiemswap/uikit'
import { ModalActions, ModalInput } from 'components/Modal'
import { useTranslation } from 'contexts/Localization'
import { getFullDisplayBalance, formatSerializedBigNumber } from 'utils/formatBalance'
import useToast from 'hooks/useToast'
import { useDigitalBondFromBondId } from 'state/bonds/hooks'
import { prettifySeconds } from 'config'
import { priceBonding } from 'utils/bondUtils'
import PoolLogo from 'components/Logo/PoolLogo'
import { deserializeToken } from 'state/user/hooks/helpers'
import { ABREQ } from 'config/constants/tokens'
import { TokenImage } from 'components/TokenImage'

interface DigitalBondingModalProps {
  chainId: number
  bondId: number
  max: BigNumber
  multiplier?: string
  lpLabel?: string
  onConfirm: (amount: string) => void
  onDismiss?: () => void
  tokenName?: string
  apr?: number
  displayApr?: string
  addLiquidityUrl?: string
  reqPrice?: number
}

const DigitalBondingModal: React.FC<DigitalBondingModalProps> = (
  {
    chainId,
    bondId,
    max,
    onConfirm,
    onDismiss,
    tokenName = '',
    addLiquidityUrl,
    reqPrice
  }
) => {
  const bond = useDigitalBondFromBondId(bondId, chainId)
  const [val, setVal] = useState('')
  const { toastSuccess, toastError } = useToast()
  const [pendingTx, setPendingTx] = useState(false)
  const { t } = useTranslation()
  const fullBalance = useMemo(() => {
    return getFullDisplayBalance(max)
  }, [max])

  const lpTokensToStake = new BigNumber(val)
  const fullBalanceNumber = new BigNumber(fullBalance)

  // calculates the payout fom the input and the payout itself in USD equivalent tokens
  const [payout, inputUSD] = useMemo(() => {
    let returnVal = ethers.BigNumber.from(0)
    let inpUSD = ethers.BigNumber.from(0)
    const formattedInput = new BigNumber(val).multipliedBy(new BigNumber('10').pow(18)).toString()
    try {
      returnVal = priceBonding(
        ethers.BigNumber.from(val === '' ? 0 : formattedInput),
        bond
      )
    }
    catch (Error) {
      console.log(Error)
    }

    try {
      inpUSD = ethers.BigNumber.from(bond.purchasedInQuote).mul(formattedInput).div(bond.market.purchased)
    } catch (Error) {
      console.log(Error)
    }

    return [Number(ethers.utils.formatEther(returnVal)), Number(ethers.utils.formatEther(inpUSD))]
  }, [
    val,
    bond
  ])

  const handleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      if (e.currentTarget.validity.valid) {
        setVal(e.currentTarget.value.replace(/,/g, '.'))
      }
    },
    [setVal],
  )


  const vesting = () => {
    return prettifySeconds(Number(bond.bondTerms?.vesting) ?? 0, 'hour');
  };


  const handleSelectMax = useCallback(() => {
    setVal(fullBalance)
  },
    [fullBalance, setVal]
  )


  const maxPriceText = (): string => {
    let text = ''
    try {

      text = `${Math.round(Number(formatSerializedBigNumber(bond.market.maxPayout, 18, 18)) * 100) / 100} ABREQ`
    }
    catch {
      text = 'no limit'
    }
    return text
  }

  const profits = useMemo(() => { return payout * reqPrice / bond.bondPrice - inputUSD }, [payout, reqPrice, bond.bondPrice, inputUSD])

  return (
    <Modal title="Bond LP tokens for abREQ." onDismiss={onDismiss}>
      <ModalInput
        value={val}
        onSelectMax={handleSelectMax}
        onChange={handleChange}
        max={fullBalance}
        symbol={tokenName}
        addLiquidityUrl={addLiquidityUrl}
        inputTitle={t('Bond')}
      />
      <Flex mt="24px" alignItems="center" justifyContent="space-between" flexDirection='row'>
        <Text mr="8px" color="textSubtle">
          You Will Pay
        </Text>
        <Flex alignItems="center" justifyContent="space-between" flexDirection='row' width='60%'>

          <Flex alignItems="center" justifyContent="center" flexDirection='row' width='100%'>
            {bond?.tokens && (<PoolLogo tokens={bond.tokens.map(tk => deserializeToken(tk))} width='20%' />)}
            <Text ml='10px' mr="2px" color="textSubtle" textAlign='left' bold >
              {inputUSD > 0 ? val : '-'}
            </Text>
          </Flex>

          <Text ml='2px' fontSize='13px' mr="2px" color="textSubtle" textAlign='center'>
            {inputUSD > 0 ? (`~$${Math.round(inputUSD * 10) / 10}`) : (`-`)}
          </Text>
        </Flex>
      </Flex>
      <Flex mt="24px" alignItems="center" justifyContent="space-between">
        <Text mr="8px" color="textSubtle">
          You Will Get
        </Text>
        <Flex alignItems="center" justifyContent="space-between" flexDirection='row' width='60%'>

          <Flex alignItems="center" justifyContent="center" flexDirection='row' width='100%'>
            <TokenImage token={ABREQ[chainId]} chainId={chainId} width={20} height={20} />
            <Text ml='10px' mr="2px" color="textSubtle" textAlign='left' bold>
              {payout > 0 ? `${Math.round(payout / bond.bondPrice * 100) / 100}` : '-'}
            </Text>
          </Flex>

          <Text ml='2px' fontSize='13px' mr="2px" color="textSubtle" textAlign='center'>
            {(reqPrice > 0 && payout > 0) ?
              (`~$${Math.round(payout * reqPrice / bond.bondPrice * 10) / 10}`) : (`-`)}
          </Text>
        </Flex>
      </Flex>
      <Flex mt="24px" alignItems="center" justifyContent="space-between">
        <Text mr="8px" color="textSubtle">
          {profits > 0 ? 'Your Profits' : 'The Premium You Pay'}
        </Text>
        <Text mr="8px" textAlign='center' bold color={profits > 0 ? 'green' : 'red'}>
          {inputUSD > 0 ?
            (`~$${(Math.round(profits * 10) / 10).toLocaleString()}`) : (`-`)}
        </Text>
      </Flex>
      <Flex mt="24px" alignItems="center" justifyContent="space-between">
        <Text mr="8px" color="textSubtle">
          Return
        </Text>
        <Text mr="8px" color="textSubtle" textAlign='center'>
          {inputUSD ? `${Math.round(profits / inputUSD * 10000) / 100}%` : '-'}
        </Text>
      </Flex>
      <Flex mt="24px" alignItems="center" justifyContent="space-between">
        <Text mr="8px" color="textSubtle">
          Maximum Payout
        </Text>
        <Text mr="8px" color="textSubtle" textAlign='center'>
          {maxPriceText()}
        </Text>
      </Flex>
      <Flex mt="24px" alignItems="center" justifyContent="space-between">
        <Text mr="8px" color="textSubtle">
          Debt Ratio
        </Text>
        <Text mr="8px" color="textSubtle" textAlign='center'>
          {`${Math.round(Number(ethers.utils.formatEther(bond.debtRatio)) * 100) / 100}%`}
        </Text>
      </Flex>
      <Flex mt="24px" alignItems="center" justifyContent="space-between">
        <Text mr="8px" color="textSubtle">
          Vesting Term
        </Text>
        <Text mr="8px" color="textSubtle" textAlign='center'>
          {vesting()}
        </Text>
      </Flex>
      <ModalActions>
        <Button variant="secondary" onClick={onDismiss} width="100%" disabled={pendingTx}>
          {t('Cancel')}
        </Button>
        <Button
          width="100%"
          disabled={
            pendingTx ||
            !lpTokensToStake.isFinite() ||
            lpTokensToStake.eq(0) ||
            lpTokensToStake.gt(fullBalanceNumber) ||
            payout / bond.bondPrice > Number(ethers.utils.formatEther(bond.market.maxPayout))
          }
          onClick={async () => {
            setPendingTx(true)
            try {
              await onConfirm(val)
              toastSuccess(t('Bonding successful!'), t('Your LP tokens have been bonded'))
              onDismiss()
            } catch (e) {
              toastError(
                t('Error'),
                t('Please try again. Confirm the transaction and make sure you are paying enough gas!'),
              )
              console.error(e)
            } finally {
              setPendingTx(false)
            }
          }}
        >
          {pendingTx ? t('Confirming') : t('Confirm')}
        </Button>
      </ModalActions>
      <LinkExternal href={addLiquidityUrl} style={{ alignSelf: 'center' }}>
        {t('Get %symbol%', { symbol: tokenName })}
      </LinkExternal>
    </Modal>
  )
}

export default DigitalBondingModal
