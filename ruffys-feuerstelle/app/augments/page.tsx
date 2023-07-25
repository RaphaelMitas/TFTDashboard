import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AugmentTable from './AugmentTable';
import tftJSON from 'data/tft.json';
import tftTypes, { Item } from 'data/tftTypes';
import Augment, { MongoAugment, DataDragonAugment } from './Augment';
import { db } from 'data/mongoDb'


async function getServerSideProps() {

  const data = (await db.collection('augments_view').find({ game_version: "Version 13.14.520.6878 (Jul 13 2023/19:59:37) [PUBLIC] <Releases/13.14>" }).toArray()) as unknown as MongoAugment[]

  const mongoData: MongoAugment[] = []
  for await (const augment of data) {
    mongoData.push(augment)
  }

  const dragonData: any = tftJSON
  return { dragonData, mongoData }
}

const communityDragonBaseURL = "https://raw.communitydragon.org/latest/game/"

export default async function AugmentPage() {
  const augmentData = await getServerSideProps().then(({ dragonData, mongoData }) => {

    const augments: Augment[] = [];

    mongoData.forEach((item: MongoAugment) => {
      const dragonDataItems: Item[] = dragonData.items
      const dragonItem = dragonDataItems.find((dragonItem: Item) => dragonItem.apiName === item.augment)

      if (!dragonItem) {
        console.log('dragonItem not found for augment: ', item.augment)
        return
      }



      const parsedIcon = dragonItem.icon.toLocaleLowerCase().replace(".tex", ".png")
      // parsedIcon = parsedIcon
      const iconURL = communityDragonBaseURL + parsedIcon;


      augments.push(new Augment({
        apiName: dragonItem.apiName,
        augmentQuality: dragonItem.augmentQuality,
        associatedTraits: dragonItem.associatedTraits,
        composition: dragonItem.composition,
        desc: dragonItem.desc,
        effects: dragonItem.effects,
        icon: iconURL,
        incompatibleTraits: dragonItem.incompatibleTraits,
        label: dragonItem.name ? dragonItem.name : '',
        ...item
      }));
    });

    // dragonData.items.forEach((item: Item) => {
    //   if (item.apiName.startsWith("TFT9_Augment_")) {

    // // let parsedIcon = item.icon.split("/");
    // const parsedIcon = item.icon.toLocaleLowerCase().replace(".tex", ".png")
    // // parsedIcon = parsedIcon
    // const iconURL = communityDragonBaseURL + parsedIcon;

    //     augments.push(new DataDragonAugment(
    //       {
    //         apiName: item.apiName,
    //         associatedTraits: item.associatedTraits,
    //         composition: item.composition,
    //         desc: item.desc,
    //         effects: item.effects,
    //         icon: iconURL,
    //         incompatibleTraits: item.incompatibleTraits,
    //         label: item.name ? item.name : '',
    //       }
    //     ));
    //   }
    // });
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
        <AugmentTable augments={Augment.toJSON(augmentData)} />
      </Box>
    </Container>
  );
}
