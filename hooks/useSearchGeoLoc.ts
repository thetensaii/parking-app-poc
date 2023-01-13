import { useEffect, useState } from "react";
import * as Location from 'expo-location'

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search?";
export const MONTREAL_LOC: [number, number] = [-73.561668, 45.508888]
export type COORDINATES = [number, number]
type FEATURE = {
    geometry: {
        coordinates: COORDINATES
    }
}

type GEOLOC_DATA_TYPE = {
    features: FEATURE[]
}

const fetchGeoLoc = (address: string) => {
    const params = {
        q: address,
        format: 'geojson'
    }
    const formattedUrlParams = new URLSearchParams(params).toString()

    return fetch(`${NOMINATIM_BASE_URL}${formattedUrlParams}`)
        .then((res) => res.text())
        .then<GEOLOC_DATA_TYPE>((data) => JSON.parse(data))
}

export const useSearchGeoLoc = () => {

    const [location, setLocation] = useState<[number, number]>(MONTREAL_LOC)
    const [loading, setLoading] = useState<boolean>(false)

    const setLocationToActualPosition = async () => {
        setLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setLoading(false);
            return;
        }

        // const location = await Location.getCurrentPositionAsync();
        const location = await Location.getLastKnownPositionAsync();
        if (!location) {
            setLoading(false);
            return;
        }

        const { longitude, latitude } = location.coords;
        setLocation([longitude, latitude]);
        setLoading(false);
    }

    useEffect(() => {
        setLocationToActualPosition()
    }, []);

    const searchAddressLoc = (address: string) => {
        setLoading(true)
        fetchGeoLoc(address).then((data) => {
            if (data.features.length === 0) return;

            setLocation(data.features[0].geometry.coordinates)
        }).finally(() => {
            setLoading(false)
        })
    }

    return {
        location,
        loading,
        setLocation,
        setLocationToActualPosition
    }
}
