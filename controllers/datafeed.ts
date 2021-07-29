import { Request, Response } from "https://deno.land/x/oak@v8.0.0/mod.ts"
import { getLastAvailable, averageMktReturns, averageMktReturnsDefault, lastBondAvailable, bondYieldReturn, allBondDate } from "../backend/calcreturn.ts"

import { QueryLastAvailable, QueryAvgMktReturns, QueryAvgMktReturnsDefault, QueryBondYield } from "../interfaces/datafeed.ts"

export default {
    lastAvailable: async({ request, response }: { request: Request, response: Response }) => {
        if (!request.hasBody) {
            response.status = 404
            response.body = {
                success: false,
                msg: "no data input"
            }
            return
        }
        const body = request.body()
        const queryLastAvailable: QueryLastAvailable = await body.value
        response.status = 200
        response.body = getLastAvailable(queryLastAvailable)
    },
    avgMktReturns: async({ request, response }: { request: Request, response: Response }) => {
        if (!request.hasBody) {
            response.status = 404
            response.body = {
                success: false,
                msg: "no data input"
            }
            return
        }
        const body = request.body()
        const queryAvgMktReturns: QueryAvgMktReturns = await body.value
        response.status = 200
        response.body = await averageMktReturns(queryAvgMktReturns)
    },
    avgMktReturnsDef: async({ request, response}: { request: Request, response: Response }) => {
        if (!request.hasBody) {
            response.status = 404
            response.body = {
                success: false,
                msg: "no data input"
            }
            return
        }
        const body = request.body()
        const queryAvgMktReturnsDefault: QueryAvgMktReturnsDefault = await body.value
        response.status = 200
        response.body = await averageMktReturnsDefault(queryAvgMktReturnsDefault)
    },
    lastBondAvailable: async ({ response }: { response: Response }) => {
        response.status = 200
        response.body = await lastBondAvailable()
    },
    bondYield: async ({ request, response }: { request: Request, response: Response }) => {
        if (!request.hasBody) {
            response.status = 404
            response.body = {
                success: false,
                msg: "no data input"
            }
            return
        }
        const body = request.body()
        const queryBondYield: QueryBondYield = await body.value
        response.status = 200
        response.body = await bondYieldReturn(queryBondYield.asof)
    },
    bondDate: async ({ response }: { response: Response }) => {
        response.status = 200
        response.body = await allBondDate()
    }
}
