import AugmentTable from "./AugmentTable";
import Augment from "./Augment";
import { getServerSession } from "next-auth";
import { Typography } from "@mui/material";

const REVALIDATE_AUGMENTS = 60 * 60 * 6 // 6 hour
export default async function AugmentSSR() {


    const res = await fetch(`${process.env.BASE_URL}/api/augments?secret=${process.env.SERVER_SECRET}`, { next: { revalidate: REVALIDATE_AUGMENTS } })
    let data: Augment[] = []
    if (res.status === 200) {
        data = (await res.json() as { augments: Augment[] }).augments
    }
    const session = await getServerSession()

    return <>
        {(session?.user?.email === 'raphael.mitas@gmail.com' || session?.user?.email === 'jvonhammel@googlemail.com') ?
            <AugmentTable augments={data} />
            :
            <>
                <Typography variant="h4" component="h1" gutterBottom>
                    Not Allowed
                </Typography>
                <Typography variant="h6" component="h2" gutterBottom>
                    Please sign in with an allowed account
                </Typography>
            </>
        }

    </>
}
