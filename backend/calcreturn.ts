import { supabase } from "./supabasedb.ts"

// interface
import type { PostgrestResponse, PostgrestSingleResponse } from "https://deno.land/x/supabase@1.1.0/mod.ts"
import type { SETReturn, BondYield, LastAvailable, LastBondAvailable } from "../interfaces/dbtypes.ts"
import type { QueryLastAvailable, QueryAvgMktReturns, QueryAvgMktReturnsDefault } from "../interfaces/datafeed.ts"

const initSETData = async (): Promise<SETReturn[]> => {
    const { data }: PostgrestResponse<SETReturn> = await supabase.from<SETReturn>("SET_Return").select("id,year,month")
    const allSETRecordsObj: SETReturn[] = Object.assign(data || [])
    return allSETRecordsObj
}

const startBondDate = async (): Promise<Date> => {
    const { data }: PostgrestSingleResponse<BondYield> = await supabase.from<BondYield>("Bond_Yield").select("id,asof").match({ id: 1 }).single()
    const startBondDate: Date = data?.asof || new Date()
    return startBondDate
}
const endBondDate = async (): Promise<Date> => {
    const { data }: PostgrestSingleResponse<BondYield> = await supabase.from<BondYield>("Bond_Yield").select("id,asof").order("id", { ascending: false }).limit(1).single()
    const endBondDate: Date = data?.asof || new Date()
    return endBondDate
}

export const allBondDate = async (): Promise<Date[]> => {
    const { data }: PostgrestResponse<{ asof: Date }> = await supabase.from<{ asof: Date }>("Bond_Yield").select("asof")
    const dataObj: { asof: Date }[] = Object.assign(data || [])
    const records: Date [] = dataObj.map(({ asof }: { asof: Date }) => { return asof })
    return records
}

const selectMissing = (type: string): number =>{
    if (type === "yearly") {
        return yearlyMissing    
    } else if (type === "monthly") {
        return monthlyMissing
    } else {
        console.log("errortype")
        return yearlyMissing
    }
}

const defaultInterval: number[] = [
    1,
    3,
    5,
    10,
    17,
    19,
    20,
    25,
    30,
    35,
    40,
    42
]
const monthString: string[] = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
]

const yearlyMissing = 12
const monthlyMissing = 1
const allSETRecordsObj: SETReturn[] = await initSETData()

export const averageMktReturns = async (query: QueryAvgMktReturns): Promise<number> => {
    const lastSETRecordsObj: SETReturn = allSETRecordsObj.find(records => records.month === query.month && records.year === query.year) || {id: 0}
    const periodId: number = lastSETRecordsObj.id
    const match: RegExpMatchArray | null = query.indicator.match("([^_]+)")
    let missingValue = yearlyMissing
    if (match) {
        missingValue = selectMissing(match[0])
    }
    const maxInterval = Math.min(periodId - missingValue, query.interval * 12)
    const offset = Math.max(periodId - query.interval * 12, missingValue)
    const { data }: PostgrestResponse<SETReturn> = await supabase.from<SETReturn>("SET_Return").select(query.indicator).range(offset, periodId)
    const allReturnObj: [] = Object.assign(data || [])
    let dataset = 0
    for(let i = 0; i < maxInterval; i++){
        dataset += allReturnObj[i][query.indicator]
    }
    const average: number = dataset / maxInterval
    return average
}

export const averageMktReturnsDefault = async(query: QueryAvgMktReturnsDefault): Promise<{ [k: number]: number }> => {
    let ret: { [k: number]: number } = {}
    for (const interval of defaultInterval) {
        const querySend = Object.assign(query, {interval: interval})
        const mktReturns = await averageMktReturns(querySend)
        const mktReturnsObjects = { [interval]: mktReturns }
        if (interval === 1) {
            ret = mktReturnsObjects
        } else {
            ret = {...ret, ...mktReturnsObjects}
        }
    }
    return ret
}

export const getLastAvailable = (type: QueryLastAvailable): LastAvailable => {
    const missing: number = selectMissing(type.type) || yearlyMissing
    const lastSETRecordsObj: SETReturn = allSETRecordsObj.slice(-1).pop() || {id: 0, year: 0, month: "", yearly_return: 0, monthly_return: 0, yearly_tri: 0, monthly_tri: 0}
    const endYear: number = lastSETRecordsObj.year || 0
    const endMonth: string = lastSETRecordsObj.month || ""
    
    const shiftYear: number = Math.floor((allSETRecordsObj.length - missing) / 12)
    const shiftMonth: number = (allSETRecordsObj.length - missing) % 12
    const startYear: number = endYear - shiftYear

    let index: number = monthString.findIndex(month => month === endMonth)
    index -= shiftMonth
    if(index < 0){
        index += monthString.length
    }
    const startMonth: string = monthString[index]
    
    const data: LastAvailable = {
        startMonth,
        startYear,
        endMonth,
        endYear
    }
    return data
}

export const bondYieldReturn = async (asof: string): Promise<BondYield> => {
    const asofString = asof.slice(0, 10)
    const { data }: PostgrestResponse<BondYield> = await supabase.from<BondYield>("Bond_Yield").select("*").match({asof: asofString})
    const bondYieldObjects: BondYield[] = Object.assign(data || [])
    return bondYieldObjects[0]
}

export const lastBondAvailable = async (): Promise<LastBondAvailable> => {
    const startDate: Date = await startBondDate()
    const endDate: Date = await endBondDate()
    const lastBondAvailableObjects: LastBondAvailable = {
        startDate,
        endDate
    }
    return lastBondAvailableObjects
}
