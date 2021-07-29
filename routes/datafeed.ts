import { Router } from "https://deno.land/x/oak@v8.0.0/mod.ts"

const router = new Router()

import datafeedController from "../controllers/datafeed.ts"

router
    .post("/api/v1/lastavailable", datafeedController.lastAvailable)
    .post("/api/v1/mktreturn", datafeedController.avgMktReturns)
    .post("/api/v1/mktreturndefault", datafeedController.avgMktReturnsDef)
    .get("/api/v1/lastbondavailable", datafeedController.lastBondAvailable)
    .post("/api/v1/bondyield", datafeedController.bondYield)
    .get("/api/v1/allbonddate", datafeedController.bondDate)

export default router
