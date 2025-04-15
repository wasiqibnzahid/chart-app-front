/*  FILE:  src/LandingPage/LandingPage.js
    ROUTE:  /src/LandingPage/LandingPage.js                                 */

    import React, { useState, useEffect, useRef, forwardRef } from 'react';
    import {
      Box, Flex, Text, Button, useBreakpointValue, Image,
    } from '@chakra-ui/react';
    import { Link as RouterLink } from 'react-router-dom';
    import { FaLock } from 'react-icons/fa';
    import {
      AiOutlineEye, AiOutlineCalendar, AiOutlineClockCircle,
    } from 'react-icons/ai';
    import nasaVideo from '../assets/150253-798222949.mp4';
    import logoImage from '../assets/Diseño sin título (1).png';
    
    /**
     * To avoid the "string refs" error, we wrap react-router's RouterLink in a forwardRef
     * component that attaches the ref to a <span> (with display: contents so it doesn't affect
     * layout). This makes sure that Chakra UI's internal ref usage works without triggering
     * warnings.
     */
    const ForwardedRouterLink = forwardRef((props, ref) => (
      <span ref={ref} style={{ display: 'contents' }}>
        <RouterLink {...props} />
      </span>
    ));
    ForwardedRouterLink.displayName = 'ForwardedRouterLink';
    
    /* ────────────────────────────────────────────────────────────────
       KEYFRAMES & GLOBAL CLASSES
    ──────────────────────────────────────────────────────────────── */
    const animations = `
      /* 1. Card entrance */
      @keyframes floatFromCenter {
        0%   { transform: scale(.2); opacity: 0 }
        50%  { transform: scale(1.1); opacity: .8 }
        100% { transform: scale(1);   opacity: 1 }
      }
      @keyframes drawBoxLine {
        to { stroke-dashoffset: 0 }
      }
    
      /* 2. Simple fade-out for the black overlay */
      @keyframes fadeOutOverlay {
        0%   { opacity: 1; }
        100% { opacity: 0; }
      }
    
      /* 3. Video reveal — boost contrast/opacity */
      @keyframes revealVideo {
        from { opacity: 0 }
        to   { opacity: 0.85 }
      }
    
      /* 4. Stars: small twinkle & slow drift downward */
      .star {
        position: absolute;
        width: 2px;
        height: 2px;
        border-radius: 50%;
        background: white;
        box-shadow: 0 0 6px 2px rgba(255,255,255,.8);
        animation: starTwinkle 3s ease-in-out infinite alternate,
                   starDrift 50s linear infinite;
      }
      @keyframes starTwinkle {
        0%, 100% { opacity: 0.8; }
        50%      { opacity: 0.2; }
      }
      @keyframes starDrift {
        0%   { transform: translateY(0); }
        100% { transform: translateY(250px); }
      }
    
      /* 5. Black overlay (empty universe) */
      .universeOverlay {
        position: fixed;
        inset: 0;
        z-index: 10000;
        pointer-events: none;
        background: #000;
        animation: fadeOutOverlay 2.5s ease forwards 4.2s;
      }
    
      /* 6. Permanent orbiting comets (white) */
      @keyframes orbitCW {
        from { transform: rotate(0deg)   translateX(260px) rotate(0); }
        to   { transform: rotate(360deg) translateX(260px) rotate(-360deg); }
      }
      @keyframes orbitCCW {
        from { transform: rotate(0deg)   translateX(320px) rotate(0); }
        to   { transform: rotate(-360deg) translateX(320px) rotate(360deg); }
      }
    `;
    
    const LandingCard = ({
      cardW, cardH, radius, icon: Icon, label,
      route, adminRoute, delay, floatCards, startDrawing,
    }) => {
      const [showLock, setShowLock] = useState(false);
      const pathRef = useRef(null);
    
      useEffect(() => {
        if (pathRef.current) {
          const len = pathRef.current.getTotalLength();
          pathRef.current.style.strokeDasharray = String(len);
          pathRef.current.style.strokeDashoffset = String(len);
        }
      }, [cardW, cardH]);
    
      return (
        <Box
          as={ForwardedRouterLink}
          to={route}
          pos="relative"
          overflow="hidden"
          bg="rgba(255,255,255,.05)"
          boxShadow="lg"
          cursor="pointer"
          borderRadius={`${radius}px`}
          w={`${cardW}px`}
          h={`${cardH}px`}
          onMouseEnter={() => setShowLock(true)}
          onMouseLeave={() => setShowLock(false)}
          style={floatCards ? { animation: 'floatFromCenter 1.8s ease forwards' } : { opacity: 0 }}
          _hover={{
            transform: 'rotateY(12deg) scale(1.07)',
            boxShadow: '0 0 15px rgba(255,255,255,.3)',
          }}
          transition="transform .4s ease"
        >
          {showLock && (
            <Button
              as={ForwardedRouterLink}
              to={adminRoute}
              leftIcon={<FaLock />}
              pos="absolute"
              top="10px"
              right="10px"
              size="xs"
              variant="ghost"
              colorScheme="whiteAlpha"
              zIndex={99}
              _hover={{ color: 'yellow.400', transform: 'scale(1.15)' }}
              _active={{ bg: 'transparent' }}
              transition="all .3s ease"
            >
              Admin
            </Button>
          )}
    
          {/* Animated border */}
          <Box as="svg" pos="absolute" inset={0} pointerEvents="none" zIndex={2}
               viewBox={`0 0 ${cardW} ${cardH}`}>
            <rect
              ref={pathRef}
              x="1"
              y="1"
              width={cardW - 2}
              height={cardH - 2}
              rx={radius}
              ry={radius}
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={startDrawing
                ? {
                    filter: 'drop-shadow(0 0 8px rgba(255,255,255,.8))',
                    animation: `drawBoxLine 1.2s ease forwards ${delay}`,
                  }
                : {}
              }
            />
          </Box>
    
          {/* Card content */}
          <Flex pos="relative" zIndex={3} w="100%" h="100%"
                direction="column" align="center" justify="center">
            <Icon size={useBreakpointValue({ base: '40px', md: '50px' })} />
            <Text mt={3} fontSize={['md', 'lg']} fontWeight="bold">{label}</Text>
          </Flex>
        </Box>
      );
    };
    
    /* ────────────────────────────────────────────────────────────────
       MAIN LANDING PAGE
    ──────────────────────────────────────────────────────────────── */
    const LandingPage = ({ handleLogout }) => {
      const [overlayVisible, setOverlayVisible] = useState(true);
      const [cardsVisible, setCardsVisible] = useState(false);
      const [floatCards, setFloatCards] = useState(false);
      const [startDrawing, setStartDrawing] = useState(false);
    
      /**
       * Timeline:
       * - At 4.2s, the black overlay begins to fade.
       * - At 6.7s, the overlay is hidden and the landing page content is shown.
       */
      useEffect(() => {
        const open = setTimeout(() => {
          setOverlayVisible(false);
          setCardsVisible(true);
          setTimeout(() => setFloatCards(true), 300);
          setTimeout(() => setStartDrawing(true), 2100);
        }, 6700);
        return () => clearTimeout(open);
      }, []);
    
      /* Responsive values */
      const cardW    = useBreakpointValue({ base: 260, md: 300 }) || 300;
      const cardH    = useBreakpointValue({ base: 150, md: 160 }) || 160;
      const radius   = 12;
      const logoSize = useBreakpointValue({ base: '120px', md: '180px' });
      const flexDir  = useBreakpointValue({ base: 'column', lg: 'row' });
      const gap      = useBreakpointValue({ base: 6, lg: 10 });
    
      const cards = [
        {
          id: 'popular',
          label: 'Popular Objects',
          icon: AiOutlineEye,
          route: '/PopularObjects',
          adminRoute: '/ADMIN-PopularObjects',
          delay: '0s',
        },
        {
          id: 'calendar',
          label: 'Digital Calendar',
          icon: AiOutlineCalendar,
          route: '/Digital-Calendar',
          adminRoute: '/ADMIN-DIGITAL-CALENDAR',
          delay: '.4s',
        },
        {
          id: 'timebox',
          label: 'Time‑Box',
          icon: AiOutlineClockCircle,
          route: '/Time-Box',
          adminRoute: '/ADMIN-TimeBox',
          delay: '.8s',
        },
      ];
    
      return (
        <Box pos="relative" w="100vw" minH="100vh" color="white" overflow="hidden">
          {/* Inject global styles */}
          <style>{animations}</style>
    
          {/* Background video (fades in after 4.2s) */}
          <video
            autoPlay muted loop playsInline preload="auto"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0,
              filter: 'brightness(1.15) contrast(1.15)',
              animation: 'revealVideo 2.5s ease forwards 4.2s',
              zIndex: 0,
            }}
          >
            <source src={nasaVideo} type="video/mp4" />
          </video>
    
          {/* Black overlay with a few twinkling stars and orbiting comets */}
          {overlayVisible && (
            <Box className="universeOverlay">
              {/* Generate more small twinkle stars */}
              {Array.from({ length: 70 }).map((_, i) => {
                const size = Math.random() * 2 + 1;
                const dur = Math.random() * 5 + 4;
                const del = Math.random() * 4;
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                return (
                  <Box
                    key={i}
                    className="star"
                    style={{
                      width: size,
                      height: size,
                      left: `${x}%`,
                      top: `${y}%`,
                      animationDuration: `${dur}s, ${dur}s`,
                      animationDelay: `${del}s, ${del}s`,
                    }}
                  />
                );
              })}
    
              {/* Generate more white comets orbiting the center */}
              {Array.from({ length: 10 }).map((_, i) => (
                <Box
                  key={i}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    margin: -4,
                    width: i % 2 ? 8 : 6,
                    height: i % 2 ? 8 : 6,
                    borderRadius: '50%',
                    background: 'white',
                    boxShadow: '0 0 6px 3px rgba(255,255,255,.9)',
                    animation: `${
                      i % 2 ? 'orbitCCW' : 'orbitCW'
                    } ${12 + i * 2}s linear infinite`,
                    animationDelay: '4.2s',
                    zIndex: 0.4,
                  }}
                />
              ))}
            </Box>
          )}
    
          {/* Logout button */}
          <Button
            pos="fixed"
            top="20px"
            right="20px"
            zIndex={2}
            variant="outline"
            borderColor="whiteAlpha.600"
            color="white"
            size="sm"
            onClick={handleLogout}
            _hover={{ bg: 'whiteAlpha.200' }}
            _active={{ bg: 'whiteAlpha.300' }}
          >
            Logout
          </Button>
    
          {/* Main content (logo and cards) — shown after overlay is gone */}
          <Flex
            direction="column"
            align="center"
            justify="center"
            gap={6}
            mt={8}
            pos="relative"
            zIndex={1}
            style={{ opacity: cardsVisible ? 1 : 0, transition: 'opacity 0.7s ease' }}
          >
            <ForwardedRouterLink to="/landing">
              <Image
                src={logoImage}
                alt="Digital Benchmarks logo"
                w={logoSize}
                mb={2}
                _hover={{
                  transform: 'scale(1.05) rotateY(5deg)',
                  transition: 'transform 0.5s ease',
                }}
              />
            </ForwardedRouterLink>
    
            <Flex direction={flexDir} justify="center" align="center" wrap="wrap" gap={gap}>
              {cards.map((c) => (
                <LandingCard key={c.id} {...c}
                  cardW={cardW} cardH={cardH} radius={radius}
                  floatCards={floatCards} startDrawing={startDrawing}
                />
              ))}
            </Flex>
          </Flex>
        </Box>
      );
    };
    
    export default LandingPage;
    
