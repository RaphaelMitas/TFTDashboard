import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AugmentTable from './AugmentTable';
import tftJSON from 'data/tft.json';
import tftTypes, { Item } from 'data/tftTypes';
import Augment from './Augment';


async function getServerSideProps() {
  const tftData: any = tftJSON
  return tftData
}

const communityDragonBaseURL = "https://raw.communitydragon.org/latest/game/"

export default async function AugmentPage() {
  const augmentData = await getServerSideProps().then((data) => {

    const augments: Augment[] = [];

    data.items.forEach((item: Item) => {
      if (item.apiName.startsWith("TFT9_Augment_")) {

        // let parsedIcon = item.icon.split("/");
        const parsedIcon = item.icon.toLocaleLowerCase().replace(".tex", ".png")
        // parsedIcon = parsedIcon
        const iconURL = communityDragonBaseURL + parsedIcon;
        console.log(iconURL);

        augments.push(new Augment(
          {
            apiName: item.apiName,
            associatedTraits: item.associatedTraits,
            composition: item.composition,
            desc: item.desc,
            effects: item.effects,
            icon: iconURL,
            incompatibleTraits: item.incompatibleTraits,
            label: item.name ? item.name : '',
          }
        ));
      }
    });

    return augments;
  });


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
        <Typography variant="body1" gutterBottom>
          Augment Page
        </Typography>
        <AugmentTable augments={Augment.toJSON(augmentData)} />
      </Box>
    </Container>
  );
}
