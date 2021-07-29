export interface QueryLastAvailable {
    type: string
}

export interface QueryAvgMktReturns {
    indicator: string,
    year: number,
    month: string,
    interval: number
}

export interface QueryAvgMktReturnsDefault {
    indicator: string,
    year: number,
    month: string,
}

export interface QueryBondYield {
    asof: string
}
