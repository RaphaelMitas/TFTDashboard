import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import tftJSON from 'data/tft.json';
import { Item } from 'data/tftTypes';
import Augment, { DBAugment as DBAugment, firebaseAugmentStatsConverter } from './Augment';
import AugmentTableIfAuth from './AugmentTableIfAuth';
import admin from 'data/firebaseAdmin'

async function getServerSideProps() {

  const firebaseDb = admin.firestore()
  const firebaseData = (await firebaseDb.collection('augmentStats')
    .where("game_version", "==", "Version 13.14.520.6878 (Jul 13 2023/19:59:37) [PUBLIC] <Releases/13.14>")
    .orderBy("augment", "asc")
    .orderBy("augment_at_stage", "asc")
    .withConverter(firebaseAugmentStatsConverter)
    .get()).docs.map(doc => doc.data())

  const data: DBAugment[] = []
  let currentAugment: DBAugment | null = null
  for await (const augment of firebaseData) {
    if (currentAugment && currentAugment.augment !== augment.augment) {
      currentAugment.average_placement = currentAugment.total_placement / currentAugment.total_games
      currentAugment.top4_percent = currentAugment.placement_1_to_4 / currentAugment.total_games
      currentAugment.win_percent = currentAugment.wins / currentAugment.total_games

      data.push(currentAugment)
      currentAugment = null
    } else {
      if (!currentAugment) {
        currentAugment = new DBAugment({
          augment: augment.augment,
          game_version: augment.game_version,
          average_placement_at_stage_2: augment.augment_at_stage === 2 ? augment.average_placement_at_stage : 0,
          average_placement_at_stage_3: augment.augment_at_stage === 3 ? augment.average_placement_at_stage : 0,
          average_placement_at_stage_4: augment.augment_at_stage === 4 ? augment.average_placement_at_stage : 0,
          total_games: augment.total_games,
          total_placement: augment.total_placement,
          average_placement: 0,
          placement_1_to_4: augment.games_with_placement_1_to_4,
          top4_percent: 0,
          wins: augment.wins,
          win_percent: 0,
        })
      } else {
        currentAugment = new DBAugment({
          augment: augment.augment,
          game_version: augment.game_version,
          average_placement_at_stage_2: augment.augment_at_stage === 2 ? augment.average_placement_at_stage : currentAugment.average_placement_at_stage_2,
          average_placement_at_stage_3: augment.augment_at_stage === 3 ? augment.average_placement_at_stage : currentAugment.average_placement_at_stage_3,
          average_placement_at_stage_4: augment.augment_at_stage === 4 ? augment.average_placement_at_stage : currentAugment.average_placement_at_stage_4,
          total_games: currentAugment.total_games + augment.total_games,
          total_placement: currentAugment.total_placement + augment.total_placement,
          average_placement: 0,
          placement_1_to_4: currentAugment.placement_1_to_4 + augment.games_with_placement_1_to_4,
          top4_percent: 0,
          wins: currentAugment.wins + augment.wins,
          win_percent: 0,
        })
      }
    }


  }

  const dragonData: any = tftJSON
  return { dragonData, data }
}

const communityDragonBaseURL = "https://raw.communitydragon.org/latest/game/"

export default async function AugmentPage() {
  const augmentData = await getServerSideProps().then(({ dragonData, data }) => {

    const augments: Augment[] = [];

    data.forEach((item: DBAugment) => {
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
        <AugmentTableIfAuth augments={Augment.toJSON(augmentData)} />
      </Box>
    </Container>
  );
}
