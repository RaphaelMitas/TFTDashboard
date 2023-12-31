'use client';

import * as React from 'react';
import { alpha, styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Paper from '@mui/material/Paper';
import { visuallyHidden } from '@mui/utils';
import { Button, Checkbox, FormControl, FormControlLabel, FormGroup, IconButton, InputBase, InputLabel, MenuItem, Select, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DataDragonAugment from './Augment';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { useEffect, useMemo } from 'react';
import CancelIcon from '@mui/icons-material/Cancel';

interface Data {
  game_version: string;
  augment: string;
  augmentQuality: string;
  tooltip: string;
  icon: string;
  games: number;
  place: string,
  top4: number,
  win: number,
  at3_2: string;
  at2_1: string;
  at4_2: string;
}

function createData({
  game_version = "",
  augment = "",
  augmentQuality = "uncategorized",
  tooltip = "",
  icon = "",
  games = 0,
  place = "0",
  top4 = 0,
  win = 0,
  at2_1 = "-",
  at3_2 = "-",
  at4_2 = "-",
}): Data {
  return {
    game_version,
    augment,
    augmentQuality,
    tooltip,
    icon,
    games,
    place,
    top4,
    win,
    at2_1,
    at3_2,
    at4_2,
  };
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'augment',
    numeric: false,
    disablePadding: true,
    label: 'Augment',
  },
  {
    id: 'games',
    numeric: true,
    disablePadding: false,
    label: 'Games',
  },
  {
    id: 'place',
    numeric: true,
    disablePadding: false,
    label: 'Place',
  },
  {
    id: 'top4',
    numeric: true,
    disablePadding: false,
    label: 'Top 4',
  },
  {
    id: 'win',
    numeric: true,
    disablePadding: false,
    label: 'Win',
  },
  {
    id: 'at2_1',
    numeric: true,
    disablePadding: false,
    label: 'At 2-1',
  },
  {
    id: 'at3_2',
    numeric: true,
    disablePadding: false,
    label: 'At 3-2',
  },
  {
    id: 'at4_2',
    numeric: true,
    disablePadding: false,
    label: 'At 4-2',
  },
];

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
  order: Order;
  orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } =
    props;
  const createSortHandler =
    (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={`headcell-${headCell.id}`}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}



const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(0),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

interface EnhancedTableToolbarProps {
  checkBoxState: {
    silver: boolean;
    gold: boolean;
    prismatic: boolean;
    uncategorized: boolean;
    min50games: boolean;
  };
  handleCheckBoxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  search: string;
  setSearch: (search: string) => void;
  gameVersion: string;
  handleGameVersionChange: (event: SelectChangeEvent<string>, child: React.ReactNode) => void;
  gameVersions: string[];
}

function EnhancedTableToolbar({
  checkBoxState,
  handleCheckBoxChange,
  search,
  setSearch,
  gameVersion,
  handleGameVersionChange,
  gameVersions,
}: EnhancedTableToolbarProps) {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
  }
  const clearSearch = () => {
    setSearch('');
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      clearSearch(); // Call clearSearch when Escape key is pressed
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Toolbar
      sx={{
        pl: { sm: 0 },
        pr: { xs: 0, sm: 0 },
      }}
    >
      <FormGroup sx={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
      }} >
        <FormControl
          size='small'
          sx={{
            width: '100%',
            mb: 1,
            mt: 0.5
          }}
        >
          <InputLabel>Game Version</InputLabel>
          <Select
            value={gameVersion}
            onChange={handleGameVersionChange}
            label="Game Version"
          >
            {gameVersions.map((gameVersion) => {
              return <MenuItem key={gameVersion} value={gameVersion} >{gameVersion.replace("Version ", "")}</MenuItem>
            })}
          </Select>
        </FormControl>
        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>

          <Box sx={{
            display: 'flex',
            flexDirection: 'row',
          }}>
            <Search sx={{ height: 40 }}>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>

              <StyledInputBase
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
                value={search}
                onChange={handleSearchChange}
              />
              {search && (
                <IconButton onClick={clearSearch} sx={{ position: 'absolute', right: 0 }}>
                  <CancelIcon />
                </IconButton>
              )}
            </Search>
          </Box>

          <FormGroup row sx={{
            display: 'flex',
            justifyContent: 'center',

          }}>
            <FormControlLabel control={<Checkbox size='medium' checked={checkBoxState.silver} onChange={handleCheckBoxChange} name='silver' />} label="Silver" />
            <FormControlLabel control={<Checkbox size='medium' checked={checkBoxState.gold} onChange={handleCheckBoxChange} name='gold' />} label="Gold" />
            <FormControlLabel control={<Checkbox size='medium' checked={checkBoxState.prismatic} onChange={handleCheckBoxChange} name='prismatic' />} label="Prismatic" />

            {/* <FormControlLabel control={<Checkbox checked={checkBoxState.uncategorized} onChange={handleCheckBoxChange} name='uncategorized' />} label="uncategorized" />        */}
          </FormGroup>
          <FormControlLabel control={<Checkbox size='medium' checked={checkBoxState.min50games} onChange={handleCheckBoxChange} name='min50games' />} label="games > 50" />

        </Box>
      </FormGroup>



    </Toolbar>
  );
}

export default function AugmentTable({ augments }: { augments: DataDragonAugment[] }) {
  const [order, setOrder] = React.useState<Order>('desc');
  const [orderBy, setOrderBy] = React.useState<keyof Data>('games');
  const [search, setSearch] = React.useState<string>('');
  const gameVersions = React.useMemo(() => {
    const gameVersions = new Set<string>();
    augments.forEach((augment) => {
      gameVersions.add(augment.game_version);
    });
    return Array.from(gameVersions).sort((a, b) => a > b ? -1 : 1);
  }, [augments]);
  const [gameVersion, setGameVersion] = React.useState<string>(gameVersions[0]);

  const handleGameVersionChange = (event: SelectChangeEvent<string>) => {
    setGameVersion(event.target.value as string);
  };

  const [checkBoxState, setCheckBoxState] = React.useState({
    silver: false,
    gold: false,
    prismatic: false,
    uncategorized: false,
    min50games: false,
  });

  const rows = augments.map((augment) => {
    return createData({
      game_version: augment.game_version,
      augment: augment.label,
      augmentQuality: augment.augmentQuality,
      tooltip: augment.desc,
      icon: augment.icon,
      games: augment.total_games,
      place: augment.average_placement.toFixed(2),
      top4: augment.top4_percent * 100,
      win: augment.win_percent * 100,
      at2_1: augment.average_placement_at_stage_2 ? augment.average_placement_at_stage_2.toFixed(2) : '~',
      at3_2: augment.average_placement_at_stage_3 ? augment.average_placement_at_stage_3.toFixed(2) : '~',
      at4_2: augment.average_placement_at_stage_4 ? augment.average_placement_at_stage_4.toFixed(2) : '~',
    })
  })


  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof Data,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };



  const handleCheckBoxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCheckBoxState({
      ...checkBoxState,
      [event.target.name]: event.target.checked,
    });
  };

  const sortedRows = useMemo(() => {
    return rows
      .filter((row) => {
        return row.augment.toLowerCase().includes(search.toLowerCase());
      }).filter((row) => {
        if (row.game_version !== gameVersion) {
          return false
        }
        if (checkBoxState.min50games) {
          if (row.games < 50) {
            return false
          }
        }
        if (!(!checkBoxState.silver && !checkBoxState.gold && !checkBoxState.prismatic && !checkBoxState.uncategorized)) {
          if (!checkBoxState.silver && row.augmentQuality === 'Silver') {
            return false
          }
          if (!checkBoxState.gold && row.augmentQuality === 'Gold') {
            return false
          }
          if (!checkBoxState.prismatic && row.augmentQuality === 'Prismatic') {
            return false
          }
          if (!checkBoxState.uncategorized && row.augmentQuality === 'uncategorized') {
            return false
          }
        }
        return true
      })
      .sort(getComparator(order, orderBy));
  }, [order, orderBy, search, checkBoxState, gameVersion, rows]);




  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2, p: 2, }}>
        <EnhancedTableToolbar
          checkBoxState={checkBoxState}
          handleCheckBoxChange={handleCheckBoxChange}
          search={search}
          setSearch={setSearch}
          gameVersion={gameVersion}
          handleGameVersionChange={handleGameVersionChange}
          gameVersions={gameVersions} />
        <TableContainer >
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size='medium'
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody >
              {sortedRows.map((row, index) => {
                return (
                  <TableRow
                    hover
                    tabIndex={-1}
                    key={index}
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      padding="none"

                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                        <Tooltip title={
                          <div>
                            <Typography variant='body1'>{row.augment}</Typography>
                            <div> Warning: The data is not official and might be wrong.</div>
                            <br />
                            <Typography variant='body2'>{row.tooltip}</Typography>
                          </div>
                        } placement="right-start">
                          <img
                            loading='lazy'
                            src={row.icon}
                            alt={row.augment}
                            height='28px'
                            width='28px'
                          />
                        </Tooltip>
                        <Box sx={{ p: 1 }} />
                        {row.augment}
                      </Box>
                    </TableCell>
                    <TableCell align="right">{row.games >= 10000 ? `${(row.games / 1000).toFixed()}K` : row.games}</TableCell>
                    <TableCell align="right">{row.place}</TableCell>
                    <TableCell align="right">{`${row.top4.toFixed()}%`}</TableCell>
                    <TableCell align="right">{`${row.win.toFixed()}%`}</TableCell>
                    <TableCell align="right">{row.at2_1}</TableCell>
                    <TableCell align="right">{row.at3_2}</TableCell>
                    <TableCell align="right">{row.at4_2}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}


export function AugmentTableSkeleton() {

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2, p: 2, }}>
        <EnhancedTableToolbar
          checkBoxState={{
            silver: false,
            gold: false,
            prismatic: false,
            uncategorized: false,
            min50games: false,
          }}
          handleCheckBoxChange={() => { }}
          search={''}
          setSearch={() => { }}
          gameVersion={''}
          handleGameVersionChange={() => { }}
          gameVersions={[]} />
        <TableContainer >
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size='medium'
          >
            <EnhancedTableHead
              order={'desc'}
              orderBy={'games'}
              onRequestSort={() => { }}
            />
            <TableBody >
              {Array.from({ length: 10 }, (_, index) => {
                return (
                  <TableRow
                    hover
                    tabIndex={-1}
                    key={index}
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      padding="none"
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                        <Skeleton variant="rounded" width={28} height={28} />
                        <Box sx={{ p: 1 }} />
                        <Skeleton variant="text" width={100} />
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton variant="text" width={100} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton variant="text" width={100} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton variant="text" width={100} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton variant="text" width={100} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton variant="text" width={100} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton variant="text" width={100} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton variant="text" width={100} />
                    </TableCell>
                  </TableRow>
                );
              }
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
