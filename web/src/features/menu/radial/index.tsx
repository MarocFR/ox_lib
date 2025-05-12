import { Box, createStyles } from '@mantine/core';
import { useEffect, useState, FC } from 'react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { useNuiEvent } from '../../../hooks/useNuiEvent';
import { fetchNui } from '../../../utils/fetchNui';
import { isIconUrl } from '../../../utils/isIconUrl';
import ScaleFade from '../../../transitions/ScaleFade';
import type { RadialMenuItem } from '../../../typings';
import { useLocales } from '../../../providers/LocaleProvider';
import LibIcon from '../../../components/LibIcon';

// Maximum items to show on each page
const PAGE_ITEMS = 8;

const useStyles = createStyles((theme) => ({
  fullscreenWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'transparent',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radialWrapper: {
    position: 'relative',
    width: '620px',
    height: '620px',
    transform: 'scale(0.85)',
    backgroundColor: 'transparent',
    '@media (max-height: 768px)': {
      transform: 'scale(0.75)',
    },
  },
  backgroundCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  pageIndicatorContainer: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '10px',
    backgroundColor: 'transparent',
  },
}));

// MenuItem Component
interface MenuItemProps {
  item: RadialMenuItem;
  position: { x: number; y: number };
  onClick: () => void;
  index: number;
}

const useMenuItemStyles = createStyles((theme) => ({
  itemContainer: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '120px',
    height: '120px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    borderRadius: '50%',
    zIndex: 5,
    '&:hover': {
      transform: 'scale(1.15)',
    },
  },
  // Glow effect behind the item
  itemGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    backgroundColor: 'rgba(65, 150, 255, 0.3)',
    opacity: 0,
    transition: 'opacity 0.3s ease, transform 0.3s ease',
  },
  // Background ring
  itemRing: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    opacity: 0,
    transition: 'opacity 0.3s ease, transform 0.3s ease',
  },
  itemIconWrapper: {
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '65px',
    height: '65px',
    transition: 'all 0.2s ease-out',
    backgroundColor: 'transparent',
    borderRadius: '50%',
    zIndex: 2,
  },
  itemLabel: {
    fontSize: '15px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: '4px',
    padding: '3px 6px',
    maxWidth: '110px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    transition: 'all 0.2s ease-out',
    zIndex: 2,
  },
}));

const MenuItem: FC<MenuItemProps> = ({ item, position, onClick, index }) => {
  const { classes } = useMenuItemStyles();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    onClick();
  };

  return (
    <div
      className={classes.itemContainer}
      style={{
        transform: `translate(${position.x - 60}px, ${position.y - 60}px) scale(${isPressed ? 0.95 : isHovered ? 1.15 : 1})`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Glow effect that appears on hover */}
      <div
        className={classes.itemGlow}
        style={{
          opacity: isHovered ? 0.8 : 0,
          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          backgroundColor: 'rgba(65, 150, 255, 0.3)'
        }}
      />

      {/* Decorative ring that appears on hover */}
      <div
        className={classes.itemRing}
        style={{
          opacity: isHovered ? 0.8 : 0,
          transform: isHovered ? 'scale(1.1) rotate(15deg)' : 'scale(1)',
        }}
      />

      {/* Icon */}
      <div
        className={classes.itemIconWrapper}
        style={{
          transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
        }}
      >
        {typeof item.icon === 'string' && isIconUrl(item.icon) ? (
          <img
            src={item.icon}
            alt={item.label}
            style={{
              width: Math.min(Math.max(item.iconWidth || 65, 0), 65),
              height: Math.min(Math.max(item.iconHeight || 65, 0), 65),
              objectFit: 'contain',
              transition: 'all 0.2s ease-out',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            }}
          />
        ) : (
          <LibIcon
            icon={item.icon as IconProp}
            size="2x"
            fixedWidth
            style={{
              color: 'white',
              transition: 'all 0.2s ease-out',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            }}
          />
        )}
      </div>

      {/* Label */}
      <div
        className={classes.itemLabel}
        style={{
          backgroundColor: isHovered ? 'rgba(0, 50, 100, 0.7)' : 'rgba(0, 0, 0, 0.4)',
          padding: isHovered ? '4px 8px' : '3px 6px',
          transform: isHovered ? 'translateY(3px)' : 'translateY(0)',
        }}
      >
        {item.label}
      </div>
    </div>
  );
};

// Center Button Component
interface CenterButtonProps {
  onClick: () => void;
  isBackButton: boolean;
}

const useCenterButtonStyles = createStyles((theme) => ({
  centerButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3333',
    border: '3px solid rgba(255, 255, 255, 0.6)',
    color: 'white',
    cursor: 'pointer',
    zIndex: 10,
    transition: 'all 0.15s ease-out',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translate(-50%, -50%) scale(1.08)',
      backgroundColor: '#ff5555',
      border: '3px solid rgba(255, 255, 255, 0.8)',
    },
    '&:active': {
      transform: 'translate(-50%, -50%) scale(0.95)',
      backgroundColor: '#cc0000',
    },
  },
  // Glow effect inside the button
  centerButtonGlow: {
    position: 'absolute',
    width: '140%',
    height: '140%',
    top: '-20%',
    left: '-20%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
    opacity: 0.5,
    transition: 'all 0.2s ease-out',
    pointerEvents: 'none',
  },
  centerIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease-out',
    zIndex: 2,
  },
}));

const CenterButton: FC<CenterButtonProps> = ({ onClick, isBackButton }) => {
  const { classes } = useCenterButtonStyles();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div
      className={classes.centerButton}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{
        transform: `translate(-50%, -50%) ${isPressed ? 'scale(0.95)' : isHovered ? 'scale(1.08)' : 'scale(1)'}`,
        backgroundColor: isPressed ? '#cc0000' : isHovered ? '#ff5555' : '#ff3333',
        border: isHovered ? '3px solid rgba(255, 255, 255, 0.8)' : '3px solid rgba(255, 255, 255, 0.6)',
      }}
    >
      <div
        className={classes.centerButtonGlow}
        style={{
          opacity: isHovered ? 0.7 : 0.5,
          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        }}
      />
      <div
        className={classes.centerIconWrapper}
        style={{
          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        <LibIcon
          icon={isBackButton ? 'arrow-rotate-left' : 'xmark'}
          fixedWidth
          size="lg"
        />
      </div>
    </div>
  );
};

// Page Indicator Component
interface PageIndicatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const usePageIndicatorStyles = createStyles((theme) => ({
  pageIndicatorDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid rgba(0, 0, 0, 0.2)',
    '&.active': {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      width: '12px',
      height: '12px',
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      transform: 'scale(1.2)',
    },
    '&:active': {
      transform: 'scale(0.9)',
    },
  },
}));

const PageIndicator: FC<PageIndicatorProps> = ({ currentPage, totalPages, onPageChange }) => {
  const { classes } = usePageIndicatorStyles();

  if (totalPages <= 1) return null;

  return (
    <>
      {Array.from({ length: totalPages }).map((_, i) => (
        <div
          key={`page-${i}`}
          className={`${classes.pageIndicatorDot} ${i+1 === currentPage ? 'active' : ''}`}
          onClick={() => onPageChange(i + 1)}
        />
      ))}
    </>
  );
};

// Main Radial Menu Component
const RadialMenu: FC = () => {
  const { classes } = useStyles();
  const { locale } = useLocales();
  const [visible, setVisible] = useState(false);
  const [menuItems, setMenuItems] = useState<RadialMenuItem[]>([]);
  const [menu, setMenu] = useState<{ items: RadialMenuItem[]; sub?: boolean; page: number; totalPages: number }>({
    items: [],
    sub: false,
    page: 1,
    totalPages: 1,
  });

  const changePage = async (newPage: number) => {
    setVisible(false);

    const didTransition: boolean = await fetchNui('radialTransition');

    if (!didTransition) return;

    setVisible(true);
    setMenu({ ...menu, page: newPage });
  };

  useEffect(() => {
    if (!menu.items.length) return;

    const totalPages = Math.ceil(menu.items.length / PAGE_ITEMS);

    if (menu.items.length <= PAGE_ITEMS) {
      setMenuItems(menu.items);
      setMenu(prev => ({ ...prev, totalPages: 1 }));
      return;
    }

    const start = (menu.page - 1) * PAGE_ITEMS;
    const end = Math.min(start + PAGE_ITEMS, menu.items.length);
    let visibleItems = menu.items.slice(start, end);

    if (end < menu.items.length && visibleItems.length < PAGE_ITEMS) {
      visibleItems.push({
        icon: 'ellipsis-h',
        label: locale.ui.more,
        isMore: true
      });
    }

    setMenuItems(visibleItems);
    setMenu(prev => ({ ...prev, totalPages: totalPages }));
  }, [menu.items, menu.page, locale.ui.more]);

  useNuiEvent('openRadialMenu', async (data: { items: RadialMenuItem[]; sub?: boolean; option?: string } | false) => {
    if (!data) return setVisible(false);
    let initialPage = 1;
    if (data.option) {
      data.items.findIndex(
        (item, index) => item.menu == data.option && (initialPage = Math.floor(index / PAGE_ITEMS) + 1)
      );
    }

    setMenu({
      items: data.items,
      sub: data.sub,
      page: initialPage,
      totalPages: Math.ceil(data.items.length / PAGE_ITEMS)
    });

    setVisible(true);
  });

  useNuiEvent('refreshItems', (data: RadialMenuItem[]) => {
    setMenu({
      ...menu,
      items: data,
      totalPages: Math.ceil(data.length / PAGE_ITEMS)
    });
  });

  // Calculate positions in Fortnite-style radial layout
  const calculateItemPosition = (index: number, totalItems: number): { x: number; y: number } => {
    const radius = 210;
    const positions = [
      { x: 0, y: -1 },     // Top
      { x: 0.7071, y: -0.7071 }, // Top-right
      { x: 1, y: 0 },      // Right
      { x: 0.7071, y: 0.7071 },  // Bottom-right
      { x: 0, y: 1 },      // Bottom
      { x: -0.7071, y: 0.7071 }, // Bottom-left
      { x: -1, y: 0 },     // Left
      { x: -0.7071, y: -0.7071 }  // Top-left
    ];

    const actualPositions = positions.slice(0, Math.max(totalItems, 4));

    if (index < actualPositions.length) {
      const pos = actualPositions[index];
      return {
        x: 310 + pos.x * radius,
        y: 310 + pos.y * radius
      };
    }

    const angle = (index * (2 * Math.PI / totalItems));
    return {
      x: 310 + Math.sin(angle) * radius,
      y: 310 - Math.cos(angle) * radius
    };
  };

  // Handle center button click
  const handleCenterButtonClick = () => {
    if (menu.page > 1) {
      changePage(menu.page - 1);
    } else {
      if (menu.sub) {
        fetchNui('radialBack');
      } else {
        setVisible(false);
        fetchNui('radialClose');
      }
    }
  };

  // Handle menu item click
  const handleItemClick = (index: number) => {
    const clickIndex = menu.page === 1 ? index : (menu.page - 1) * PAGE_ITEMS + index;

    if (!menuItems[index].isMore) {
      fetchNui('radialClick', clickIndex);
    } else {
      changePage(menu.page + 1);
    }
  };

  // Handle page indicator click
  const handlePageChange = (page: number) => {
    if (page !== menu.page) {
      changePage(page);
    }
  };

  if (!visible) return null;

  return (
    <ScaleFade visible={visible}>
      <div
        className={classes.fullscreenWrapper}
        onContextMenu={(e) => {
          e.preventDefault();
          handleCenterButtonClick();
        }}
      >
        <Box className={classes.radialWrapper}>
          <div className={classes.backgroundCircle} />

          {/* Menu Items */}
          {menuItems.map((item, index) => (
            <MenuItem
              key={`item-${index}`}
              item={item}
              position={calculateItemPosition(index, menuItems.length)}
              onClick={() => handleItemClick(index)}
              index={index}
            />
          ))}

          {/* Center Button */}
          <CenterButton
            onClick={handleCenterButtonClick}
            isBackButton={menu.page > 1 || !!menu.sub}
          />

          {/* Page Indicators */}
          <div className={classes.pageIndicatorContainer}>
            <PageIndicator
              currentPage={menu.page}
              totalPages={menu.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </Box>
      </div>
    </ScaleFade>
  );
};

export default RadialMenu;
