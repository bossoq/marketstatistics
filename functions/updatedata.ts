import { DOMParser, HTMLDocument, Node } from "https://deno.land/x/deno_dom@v0.1.12-alpha/deno-dom-wasm.ts"

import { supabase } from "../backend/supabasedb.ts"
import { getTimestamp } from "./gettimestamp.ts"

// interface
import type { PostgrestResponse, PostgrestSingleResponse } from "https://deno.land/x/supabase@1.1.0/mod.ts"
import type { TBMABondYield, SETInfoOfficial, SETReturnOfficial } from "../interfaces/fetchtypes.ts"
import type { SETInfo, SETReturn, BondYield, LastAvailable, LastBondAvailable } from "../interfaces/dbtypes.ts"

export const updateBondYield = async () => {
    const setBondUrl = "http://www.thaibma.or.th/yieldcurve/getintpttm?year="
    
    const fetchBondData = async (): Promise<TBMABondYield[]> => {
        const year = new Date().getFullYear()
        const response = await fetch(setBondUrl+year.toString())
        return response.json()
    }
    
    const lastBondRecords = async (): Promise<BondYield> => {
        const { data }: PostgrestSingleResponse<BondYield> = await supabase.from<BondYield>("Bond_Yield").select("*").order("id", { ascending: false }).limit(1).single()
        const lastBondRecords: BondYield = Object.assign(data || [])
        return lastBondRecords
    }
    
    const fetchBond: TBMABondYield[] = await fetchBondData()
    const lastBond: BondYield = await lastBondRecords()
    const lastIndex: number = fetchBond.findIndex(records => records.asof?.toString().slice(0, 10) === lastBond.asof)
    
    fetchBond.forEach((record: TBMABondYield) => {
        Object.keys(record).forEach((key: string) => {
            const unknownKey = key as keyof TBMABondYield
            if(record[unknownKey] === null && unknownKey !== "asof") {
                record[unknownKey] = 0
            }
        })
    })

    if (fetchBond.length - lastIndex > 1) {
        const { error }: PostgrestResponse<BondYield> = await supabase.from<BondYield>("Bond_Yield").insert(fetchBond.slice(lastIndex + 1))
        if (error === null) {
            console.log(`[INFO] [${getTimestamp()}] Update Bond Yield ${fetchBond.length - lastIndex - 1} records`)
        } else {
            console.log(`[WARN] [${getTimestamp()}] Unable to update Bond Yield`)
        }
    } else {
        console.log(`[INFO] [${getTimestamp()}] No New Bond Yield Data`)
    }
}

export const updateMarketIndex = async () => {
    const fetchHTML = async (url: string): Promise<string> => {
        const response = await fetch(url)
        return response.text()
    }

    const setIndexUrl = "https://www.set.or.th/static/mktstat/Table_Index.xls"
    const setHTML = await fetchHTML(setIndexUrl)
    const divYieldUrl = "https://www.set.or.th/static/mktstat/Table_Yield.xls"
    const divYieldHTML = await fetchHTML(divYieldUrl)
    
    const fetchSETData = async (): Promise<SETInfoOfficial[]> => {
        let records: SETInfoOfficial[] = []
        const setHTMLDOM: HTMLDocument | null = new DOMParser().parseFromString(setHTML, "text/html")
        const setTable: Node | undefined = setHTMLDOM?.querySelectorAll("TABLE").item(1)
        const divHTMLDOM: HTMLDocument | null = new DOMParser().parseFromString(divYieldHTML, "text/html")
        const divTable: Node | undefined = divHTMLDOM?.querySelectorAll("TABLE").item(1)
        if (setTable && divTable) {
            if (setTable.children.item(1).children.length === divTable.children.item(0).children.length - 1) {
                for (let i = 0; i < setTable.children.item(1).children.length; i++) {
                    const [month, year]: string[] = setTable.children.item(1).children.item(i).children.item(0).textContent.split("-")
                    const setindex: number = parseFloat(setTable.children.item(1).children.item(i).children.item(1).textContent.replace("," , ""))
                    const divyield: number = parseFloat(divTable.children.item(0).children.item(i + 1).children.item(1).textContent.replace(",", ""))
                    const record: SETInfoOfficial = {year: parseInt(year), month, setindex, divyield}
                    records.push(record)
                }
            }
        }
        return records.reverse()
    }
    
    const lastSETRecords = async (): Promise<SETInfo> => {
        const { data }: PostgrestSingleResponse<SETInfo> = await supabase.from<SETInfo>("SET_Info").select("*").order("id", { ascending: false }).limit(1).single()
        const lastSETRecords: SETInfo = Object.assign(data || [])
        return lastSETRecords
    }
    
    const fetchSET: SETInfoOfficial[] = await fetchSETData()
    const lastSET: SETInfo = await lastSETRecords()
    const lastSETIndex: number = fetchSET.findIndex(records => records.year === lastSET.year && records.month?.toString() === lastSET.month)
    
    fetchSET.forEach((record: SETInfoOfficial) => {
        Object.keys(record).forEach((key: string) => {
            const unknownKey = key as keyof SETInfoOfficial
            if (record[unknownKey] === null && unknownKey !== "year" && unknownKey !== "month") {
                record[unknownKey] = 0
            }
        })
    })

    if (fetchSET.length - lastSETIndex > 1) {
        const { error }: PostgrestResponse<SETInfo> = await supabase.from<SETInfo>("SET_Info").insert(fetchSET.slice(lastSETIndex + 1))
        if (error === null) {
            console.log(`[INFO] [${getTimestamp()}] Update Market Index ${fetchSET.length - lastSETIndex - 1} records`)
        } else {
            console.log(`[WARN] [${getTimestamp()}] Unable to update Market Index`)
        }
    } else {
        console.log(`[INFO] [${getTimestamp()}] No New Market Index Data`)
    }

    const calSETReturn = (): SETReturnOfficial[] => {
        let records: SETReturnOfficial[] = []
        for (let i = 0; i < fetchSET.length; i++) {
            const year = fetchSET[i].year
            const month = fetchSET[i].month
            let monthly_return: number
            let monthly_tri: number
            if (i > 0) {
                const curSET: number = fetchSET[i].setindex || 0
                const prevSET: number = fetchSET[i - 1].setindex || 1
                const curDIV: number = fetchSET[i].divyield || 0
                monthly_return = (((curSET / prevSET) ** 12) - 1) * 100
                monthly_tri = monthly_return + curDIV
            } else {
                monthly_return = 0
                monthly_tri = 0
            }
            let yearly_return: number
            let yearly_tri: number
            if (i > 11) {
                const curSET: number = fetchSET[i].setindex || 0
                const prevSET: number = fetchSET[i - 12].setindex || 1
                const curDIV: number = fetchSET[i].divyield || 0
                yearly_return = ((curSET / prevSET) - 1) * 100
                yearly_tri = yearly_return + curDIV
            } else {
                yearly_return = 0
                yearly_tri = 0
            }
            const record: SETReturnOfficial = {year, month, yearly_return, monthly_return, yearly_tri, monthly_tri}
            records.push(record)
        }
        return records
    }

    const lastSETReturnRecords = async (): Promise<SETReturn> => {
        const { data }: PostgrestSingleResponse<SETReturn> = await supabase.from<SETInfo>("SET_Return").select("*").order("id", { ascending: false }).limit(1).single()
        const lastSETReturnRecords: SETReturn = Object.assign(data || [])
        return lastSETReturnRecords
    }

    const calSET: SETInfoOfficial[] = calSETReturn()
    const lastSETReturn: SETReturn = await lastSETReturnRecords()
    const lastSETReturnIndex: number = calSET.findIndex(records => records.year === lastSETReturn.year && records.month?.toString() === lastSETReturn.month)

    if (calSET.length - lastSETReturnIndex > 1) {
        const { error }: PostgrestResponse<SETReturn> = await supabase.from<SETReturn>("SET_Return").insert(calSET.slice(lastSETReturnIndex + 1))
        if (error === null) {
            console.log(`[INFO] [${getTimestamp()}] Update Market Return ${calSET.length - lastSETReturnIndex - 1} records`)
        } else {
            console.log(`[WARN] [${getTimestamp()}] Unable to update Market Return`)
        }
    } else {
        console.log(`[INFO] [${getTimestamp()}] No New Market Return Data`)
    }
}
