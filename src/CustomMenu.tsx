import { useTranslation } from 'contexts/Localization'
import React from 'react'
import UserMenu from 'components/Menu/UserMenu'
import GlobalSettings from 'components/Menu/GlobalSettings'
import ChainIdSelector from 'ChainIdSelector'

const CustomMenu: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        height: 70,
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        display: 'flex',
        zIndex: 9,
        paddingRight: 15,
        background: '#08060B',
      }}
    >
      <GlobalSettings />
      <ChainIdSelector/>
      <UserMenu />
    </div>
  )
}

export default CustomMenu