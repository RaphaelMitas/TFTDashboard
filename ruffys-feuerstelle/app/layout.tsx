import * as React from 'react';
import { Roboto } from 'next/font/google';
import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeIcon from '@mui/icons-material/Home';
import ThemeRegistry from '../styles/ThemeRegistry';
import AugmentIcon from 'components/icons/AugmentsIcon';
import NextAuthProvider from './AuthProvider';
import Login from './Login';

export const metadata = {
  title: 'Ruffys Feuerstelle',
  description: 'Ruffys Feuerstelle',
};

const roboto = Roboto({ weight: ['300', '400', '500', '700'], subsets: ['latin'] });

const DRAWER_WIDTH = 240;

const LINKS = [
  { text: 'Home', href: '/', icon: HomeIcon },
  // { text: 'Champions', href: '/champions', icon: AugmentIcon },
  // { text: 'Traits', href: '/traits', icon: AugmentIcon },
  { text: 'Augments', href: '/augments', icon: AugmentIcon },
];

const PLACEHOLDER_LINKS: { text: string; icon: React.ElementType }[] = [
  // { text: 'Settings', icon: SettingsIcon },
  // { text: 'Support', icon: SupportIcon },
  // { text: 'Logout', icon: LogoutIcon },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <ThemeRegistry>
          <NextAuthProvider>
            <AppBar position="fixed" sx={{ zIndex: 2000 }}>
              <Toolbar sx={{ backgroundColor: 'background.paper' }}>

                <DashboardIcon sx={{ color: '#4DCAE6', mr: 2, transform: 'translateY(-2px)' }} />
                <Typography variant="h6" noWrap component="div" >
                  Ruffys Feuerstelle
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                </Box>
                <Login />
              </Toolbar>
            </AppBar>
            <Drawer
              sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                  width: DRAWER_WIDTH,
                  boxSizing: 'border-box',
                  top: ['48px', '56px', '64px'],
                  height: 'auto',
                  bottom: 0,
                },
              }}
              variant="permanent"
              anchor="left"
            >
              <Divider />
              <List>
                {LINKS.map(({ text, href, icon: Icon }) => (
                  <ListItem key={href} disablePadding>
                    <ListItemButton component={Link} href={href}>
                      {Icon &&
                        <ListItemIcon>
                          <Icon />
                        </ListItemIcon>
                      }
                      <ListItemText primary={text} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ mt: 'auto' }} />
              <List>
                {PLACEHOLDER_LINKS.map(({ text, icon: Icon }) => (
                  <ListItem key={text} disablePadding>
                    <ListItemButton>
                      <ListItemIcon>
                        <Icon />
                      </ListItemIcon>
                      <ListItemText primary={text} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Drawer>
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                bgcolor: 'background.default',
                ml: `${DRAWER_WIDTH}px`,
                mt: ['48px', '56px', '64px'],
                p: 3,
              }}
            >
              {children}
            </Box>
          </NextAuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
