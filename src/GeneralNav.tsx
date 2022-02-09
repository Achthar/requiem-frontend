import { UserMenu as UIKitUserMenu, ButtonMenu, ButtonMenuItem, useMatchBreakpoints, UserMenuItem, Flex, ChevronRightIcon, MenuEntry, Text, ChevronDownIcon, UserMenuDivider, SwapIcon } from '@requiemswap/uikit'
import config, { configData, getIcon } from 'components/Menu/config'
import Sidebar from 'components/Sidebar'
import { ChevronsLeft } from 'react-feather'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { useHistory, useLocation } from 'react-router'
import { useNetworkState } from 'state/globalNetwork/hooks'
import styled from 'styled-components'
import getChain from 'utils/getChain'
import React, { useCallback, useRef } from 'react';
import { NavLink } from 'react-router-dom';

import logo from './assets/logoTransparent.svg'
import bgSidebar from './assets/sidebar/bg-sidebar.png';
import iconHome from './assets/sidebar/ic-home.svg';
import iconBank from './assets/swap.svg';
import iconGovernment from './assets/sidebar/ic-government.svg';
import iconPools from './assets/farms.svg';
import iconMedium from './assets/sidebar/ic-medium.svg';
import iconDiscord from './assets/sidebar/ic-discord.svg';
import iconTelegram from './assets/sidebar/ic-telegram.svg';
import iconGithub from './assets/sidebar/ic-github.svg';
import iconTwitter from './assets/sidebar/ic-twitter.svg';
import iconDoc from './assets/sidebar/ic-doc.svg';
import iconLiquidity from './assets/liquidity.svg';
import iconAudit from './assets/sidebar/audit.svg';

import bond from './assets/bonds2.svg'
import iconDragonBall from './assets/sidebar/ic-dragon.png';


export const ExternalLinks = {
  twitter: 'https://twitter.com/xz',
  documentations: 'https://docs.xz',
  codes: 'https://github.com/Achthar',
  discord: 'https://discord.gg/HuekxzYj3p',
  medium: 'https://medium.com/@x',
  telegram: 'https://t.me/+Lbc1zHODTQw3YWM6',
  buyShareHref:
    'xD',
};

interface LogoProps {
  shorten?: boolean;
}

const Logo: React.FC<LogoProps> = ({ shorten }) => {
  return (
    <StyledLogo to="/">
      {
        shorten ?
          <img src='https://requiem-finance.s3.eu-west-2.amazonaws.com/logos/tokens/REQT.png' height="48" alt='' /> :
          <img src='https://requiem-finance.s3.eu-west-2.amazonaws.com/logos/tokens/REQT.png' height="48" alt='' />
      }
    </StyledLogo>
  );
};

const StyledLogo = styled(NavLink)`
  align-items: center;
  display: flex;
  @media (max-width: 768px) {
    img {
      height: 46px;
    }
  }
`;

interface NavContainerProps {
  chainId?: number
  onClickItem?: () => void;
}

const NavContainer: React.FC<NavContainerProps> = ({ chainId, onClickItem }) => {
  const handleClick = useCallback(() => {
    if (!onClickItem) return;
    onClickItem();
  }, [onClickItem]);
  const chain = getChain(chainId)
  return (
    <StyledNavContainer>
      <StyledNavItem onClick={handleClick}>
        <StyledNavLink to="/" activeClassName="active" exact>
          <img src={iconHome} alt='' />
          Home
        </StyledNavLink>
      </StyledNavItem>
      <StyledNavItem onClick={handleClick}>
        <StyledNavLink to={`/${chain}/exchange`} activeClassName="active">
           <img src={iconBank} alt='' />
          Exchange
        </StyledNavLink>
      </StyledNavItem>
      <StyledNavItem onClick={handleClick}>
        <StyledNavLink to={`/${chain}/liquidity`} activeClassName="active">
          <img src={iconLiquidity} alt='' />
          Liquidity
        </StyledNavLink>
      </StyledNavItem>
      <StyledNavItem onClick={handleClick}>
        <StyledNavLink to={`/${chain}/farms`}>
          <img src={iconPools} alt='' />
          Farms
        </StyledNavLink>
      </StyledNavItem>
      <StyledNavItem onClick={handleClick}>
        <StyledNavLink to={`/${chain}/bonds`}>
          <img src={bond} alt='' />
          Bonds
        </StyledNavLink>
      </StyledNavItem>

      <StyledNavItem onClick={handleClick}>
        <StyledLinkHref
          href={ExternalLinks.documentations}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={iconDoc} alt='' />
          Documentations
          <i className="fas fa-external-link" />
        </StyledLinkHref>
      </StyledNavItem>
    </StyledNavContainer>
  );
};

const MenuBar: React.FC = () => {
  const { chainId } = useNetworkState()
  return (
    <div style={{
      marginBottom: '64px',
    }}>
      <StyledSidebar>
        {/* <StyledLogoContainer>
          <Logo />
        </StyledLogoContainer> */}
        <NavContainer chainId={chainId} />
        {/* <StyledAudit
          href="https://docs.iron.finance/audits"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={iconAudit} alt='' />
        </StyledAudit> */}

        <UserMenuDivider />
        <Flex flexDirection="row" alignItems='left'>
          <StyledExternalLink>
            <StyledLink target="_blank" rel="noopener noreferrer" href={ExternalLinks.medium}>
              <StyledIcon>
                <img src={iconMedium} alt='' />
              </StyledIcon>
            </StyledLink>
            <StyledLink target="_blank" rel="noopener noreferrer" href={ExternalLinks.twitter}>
              <StyledIcon>
                <img src={iconTwitter} alt='' />
              </StyledIcon>
            </StyledLink>
            <StyledLink target="_blank" rel="noopener noreferrer" href={ExternalLinks.discord}>
              <StyledIcon>
                <img src={iconDiscord} alt='' />
              </StyledIcon>
            </StyledLink>
            <StyledLink target="_blank" rel="noopener noreferrer" href={ExternalLinks.telegram}>
              <StyledIcon>
                <img src={iconTelegram} alt='' />
              </StyledIcon>
            </StyledLink>
            <StyledLink target="_blank" rel="noopener noreferrer" href={ExternalLinks.codes}>
              <StyledIcon>
                <img src={iconGithub} alt='' />
              </StyledIcon>
            </StyledLink>
          </StyledExternalLink>
        </Flex>
      </StyledSidebar>
    </div>
  );
};

const StyledAudit = styled.a`
  align-self: center;
  img {
    width: 93px;
    margin-bottom: 23px;
  }
`;

const StyledExternalLink = styled.div`
  display: grid;
  grid-template-columns: auto auto auto auto auto;
  justify-items: center;
  margin-bottom: 30px;
  padding: 0px 20px;
`;

const StyledIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  border-radius: 100%;
  border: solid 1px #2b2a35;
  img {
    width: 15px;
  }
  &:hover {
    border-color: ${(props) => props.theme.colors.primary};
    background-color: ${(props) => props.theme.colors.primary};
    img {
      filter: brightness(0) invert(1);
    }
  }
`;

const StyledLink = styled.a`
  color: ${(props) => props.theme.colors.primary};
  text-decoration: none;
  &:hover {
    color: ${(props) => props.theme.colors.primary};
  }
`;

const StyledSidebar = styled.div`
  border-radius: 20px;
  position: fixed;
  padding-top: 32px;
  width: 100%;
  height: 450px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  background-size: 216px;
  @media (max-width: ${({ theme }) => theme.breakpoints}) {
    display: none;
  }
  border: 1px solid white;
`;

const StyledLogoContainer = styled.div`
  display: flex;
  justify-content: center;
  h1 {
    color: ${({ theme }) => theme.colors.primaryDark};
    padding: 0;
    margin: 0;
  }
`;

const StyledNavContainer = styled.ul`
  padding: 0px;
  margin-top: 25px;
  flex: 1;
  overflow-y: auto;
  ::-webkit-scrollbar {
    width: 12px;
  }

  ::-webkit-scrollbar-track {
    background: #111327;
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: #191d3a;
  }
`;

const StyledNavItem = styled.li`
  display: flex;
  align-items: center;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  width: 100%;
  height: 52px;
  padding: 0px 28px;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  color: #8f929a;
  border-left: solid 5px transparent;
  img {
    width: 20px;
    height: 20px;
    margin-right: 15px;
  }
  &.active,
  &.matched {
    font-weight: 500;
    background: #1a1d2f;
    color: ${({ theme }) => theme.colors.primaryBright};
    border-left: solid 5px #54051d;
    img {
      filter: brightness(0) invert(1);
    }
  }
  &:not(.active):hover {
    font-weight: 500;
    background: #1a1d2f;
    color: ${({ theme }) => theme.colors.primaryBright};
    border-left: solid 5px #54051d22;
    img {
      filter: brightness(0) invert(1);
    }
  }
  @media screen and (min-width: 720px) {
    top: 50px;
  }
`;

const StyledLinkHref = styled.a`
  display: flex;
  align-items: center;
  width: 100%;
  height: 52px;
  padding: 0px 28px;
  font-weight: 500;
  font-size: 18px;
  color: #8f929a;
  text-decoration: none;
  font-size: 16px;
  border-left: solid 5px transparent;
  i {
    margin-left: 8px;
    font-size: 12px;
  }
  img {
    width: 20px;
    height: 20px;
    margin-right: 15px;
  }
  &.active,
  &.matched {
    background: #1a1d2f;
    color: ${({ theme }) => theme.colors.primaryBright};
    border-left: solid 5px #fea430;
  }
  &:hover {
    font-weight: 500;
    background: #1a1d2f;
    color: ${({ theme }) => theme.colors.primaryBright};
    border-left: solid 5px #fea43022;
    img {
      filter: brightness(0) invert(1);
    }
  }
`;

const StyledAuthorView = styled.a`
  padding-bottom:80px;
  text-decoration: none;
  font-size: 13px;
  color: #8f929a;
  text-align: center;
  &:hover {
    color: #fea430;
  }
`;


export const ActivatorButton = styled.button`
  zIndex: 8;
  height: 52px;
  background-color: ${({ theme }) => theme.colors.tertiary};
  border-left: solid 5px transparent;
  border: none;
  width:1000px;
  border-radius: 30px;
  font-size: 0.875rem;
  font-weight: 400;
  margin-left: 0.4rem;
  margin-right: 0.4rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.background};
  display: flex;
  justify-content: space-between;
  align-items: center;
  float: right;
  width: 530px;

  &:hover {
    font-weight: 500;
    background: #1a1d2f;
    color: ${({ theme }) => theme.colors.primaryBright};
    border-left: solid 10px white;
  }
  :focus {
    background-color: ${({ theme }) => theme.colors.dropdown};
    outline: none;
  }
`
const ImageContainer = styled.div`
  width: 40px;
  height: 100%;
  margin-left: 1px;
`

const LIQUIDITY_ROUTES = ['/add', '/find', '/remove']

interface MenuProps {
  history: any
  current: any
  menuItem: any
  isMobile: boolean
}


const MenuItem: React.FC<MenuProps> = ({ history, current, menuItem, isMobile }) => {
  return (
    <>
      <StyledNavItem onClick={() => {
        history.push(menuItem.href)
      }}>
        <StyledNavLink to="/" activeClassName="active" exact>
          <img src={current?.label === menuItem?.label ? menuItem.iconSelected : menuItem.icon} alt='' />
          {menuItem.label}
        </StyledNavLink>
      </StyledNavItem>
    </>


  )
}



export const configDataEntries: (chainId: number) => MenuEntry[] = (chainId) => {
  const chain = getChain(chainId)
  return [
    {
      label: 'Home',
      icon: logo,
      iconSelected: logo,
      href: '/',
    },
    {
      label: 'Exchange',
      icon: iconBank,
      iconSelected: iconBank,
      href: `/${chain}/exchange`,
    },
    {
      label: 'Liquidity',
      icon: iconLiquidity,
      iconSelected: iconLiquidity,
      href: `/${chain}/liquidity`,
    },
    {
      label: 'Farms',
      icon: iconPools,
      iconSelected: iconPools,
      href: `/${chain}/farms`,
    },
    {
      label: 'Bonds',
      icon: bond,
      iconSelected: bond,
      href: `/${chain}/bonds`,
    },
    // {
    //   label: 'Pools'),
    //   icon: 'https://requiem-finance.s3.eu-west-2.amazonaws.com/icons/menu/staking.svg',
    //   href: '/pools',
    // },
  ]
}

const GeneralNav: React.FC = () => {
  const history = useHistory()
  const location = useLocation()
  const { isMobile } = useMatchBreakpoints()
  const { chainId } = useNetworkState()
  const menuItems = configDataEntries(chainId) // config(t)

  const activeIndex = menuItems.findIndex((i) => {
    const pathname = location.pathname.match(new RegExp(`^${LIQUIDITY_ROUTES.join('|^')}`))
      ? '/liquidity'
      : location.pathname
    return i.href.match(new RegExp(`^${pathname}`))
  })

  const [isOpen, setIsOpen] = React.useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const wrapperRef = useRef<HTMLDivElement>()
  useOnClickOutside(wrapperRef, () => setIsOpen(false))

  const [activeIndex1, setActiveIndex] = React.useState(-1);

  const current = menuItems[activeIndex]
  const fbIcon = location.pathname.includes('remove') || location.pathname.includes('add') ? getIcon('Liquidity') : current?.icon
  const fbLabel = location.pathname.includes('remove') || location.pathname.includes('add') ? 'Liquidity' : current?.label
  const activatorRef = React.useRef<HTMLButtonElement | null>(null);
  return (
    <div ref={wrapperRef}>
      <ActivatorButton
        aria-haspopup="true"
        aria-controls="dropdown1"
        onClick={handleClick}
        ref={activatorRef}
        onFocus={() => setActiveIndex(-1)}
      >
        <Flex flexDirection="row">
          <ImageContainer>
            <img src={fbIcon ?? 'https://requiem-finance.s3.eu-west-2.amazonaws.com/logos/requiem/REQT_large.png'} alt='' />
          </ImageContainer>
          <Text bold textAlign='center' paddingTop='9px' marginLeft='15px'>
            {fbLabel}
          </Text>

        </Flex>
      </ActivatorButton>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: '64px',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <MenuBar />
        </div>
      )}

    </div>
  )
}

export default GeneralNav
