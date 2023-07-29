import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Augment, { } from './Augment';
import AugmentTable from './AugmentTable';
import { getServerSession } from 'next-auth';
import { authOptions } from 'app/api/auth/[...nextauth]/route';
import { Typography } from '@mui/material';

export default async function AugmentPage() {

  const REVALIDATE_AUGMENTS = 60 * 60 * 6 // 6 hour
  //fetch from local api route
  const res = await fetch(`${process.env.BASE_URL}/api/augments?secret=${process.env.SERVER_SECRET}`, { next: { revalidate: REVALIDATE_AUGMENTS } })
  let data: Augment[] = []
  if (res.status !== 200) {
    console.log('Error fetching from local api route')
  } else {
    console.log('Successfully fetched from local api route')
    data = (await res.json() as { augments: Augment[] }).augments
  }


  const session = await getServerSession(authOptions);


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
        {(session?.user?.email === '***REMOVED***' || session?.user?.email === '***REMOVED***') ?
          <AugmentTable augments={Augment.toJSON(data)} /> :
          <>
            <Typography variant="h4" component="h1" gutterBottom>
              Not Allowed
            </Typography>
            <Typography variant="h6" component="h2" gutterBottom>
              Please sign in with an allowed account
            </Typography>
          </>
        }
      </Box>
    </Container>
  );
}

