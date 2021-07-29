import { cron } from "https://deno.land/x/deno_cron@v1.0.0/cron.ts"

import { updateBondYield, updateMarketIndex } from "./updatedata.ts"

export const cronUpdate = () => {
    cron('0 0 8 * * *', async () => {
    await updateBondYield()
    await updateMarketIndex()
    })
}
