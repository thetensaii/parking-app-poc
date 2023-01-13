import { useState } from "react"
import { GEOAPIFY_AUTOCOMPLETE_BASE_URL, GEOAPIFY_API_KEY } from '@env'

type GeoapifyAutocompleteResponse = {
    features: Feature[]
}

type Feature = {
    properties: {
        formatted: string,
        rank: {
            confidence: number
        },
    },
    geometry: {
        coordinates: [number, number]
    }
}

type Proposal = {
    id: string,
    address: string,
    coords: {
        longitude: number,
        latitude: number,
    }
}

let controller = new AbortController()
let signal = controller.signal


const fetchAddressAutocomplete = (address: string): Promise<GeoapifyAutocompleteResponse> => {
    const params = {
        text: address,
        format: 'geojson',
        apiKey: GEOAPIFY_API_KEY,
        lang: 'fr',
        filter: 'countrycode:ca'
    }

    const formattedUrlParams = new URLSearchParams(params).toString()

    const url = new URL(GEOAPIFY_AUTOCOMPLETE_BASE_URL)
    let p: keyof typeof params;
    for (p in params) {
        url.searchParams.append(p, params[p])
    }

    return fetch(url.toString(), {
        signal: signal
    })
        .then((res) => res.text())
        .then<GeoapifyAutocompleteResponse>((data) => JSON.parse(data))
}

export const useAutoCompleteAddress = () => {
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [loading, setLoading] = useState<boolean>(false)

    const getAutocompleteAddress = (address: string): void => {
        setLoading(true)
        controller.abort()
        controller = new AbortController()
        signal = controller.signal;

        fetchAddressAutocomplete(address).then((data) => {

            const { features } = data;

            const newProposals =
                features
                    .sort((featureA, featureB) => {
                        return featureA.properties.rank.confidence - featureB.properties.rank.confidence
                    })
                    .map((feature, idx): Proposal => ({
                        id: idx.toString(),
                        address: feature.properties.formatted,
                        coords: {
                            longitude: feature.geometry.coordinates[0],
                            latitude: feature.geometry.coordinates[1]
                        }
                    }))
            setProposals(newProposals)
        }).catch(() => {
            console.log("ERROR")
            setProposals([])
        }).finally(() => {
            setLoading(false)
        })
    }

    return {
        proposals,
        loading,
        setProposals,
        getAutocompleteAddress
    }
}
