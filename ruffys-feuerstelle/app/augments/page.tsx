import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { Suspense } from 'react';
import AugmentSSR from './AugmentSSR';
import { AugmentTableSkeleton } from './AugmentTable';

export default async function AugmentPage() {

  return (
    <Container>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Suspense fallback={<AugmentTableSkeleton />}>
          <AugmentSSR />
        </Suspense>
      </Box>
    </Container>
  );
}

