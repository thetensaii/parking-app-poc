import { useState } from "react"
import { COORDINATES } from "./useSearchGeoLoc"
const DEGREE_PER_METER = 1 / 111_111
const maxCoordinateOffsetAroundLoc = 500 * DEGREE_PER_METER;

const isNegativeRandomly = (): boolean => {
    return Math.random() > 0.5;
}

const getRandomLocsAroundLoc = (loc: COORDINATES): COORDINATES[] => {
    const locs: COORDINATES[] = []

    const numberOfLocs = Math.floor(Math.random() * 7)

    for (let i = 0; i < numberOfLocs; i++) {
        let longitude = Math.random() * maxCoordinateOffsetAroundLoc;
        if (isNegativeRandomly()) longitude *= -1;

        let latitude = Math.random() * maxCoordinateOffsetAroundLoc;
        if (isNegativeRandomly()) latitude *= -1;

        locs.push([
            longitude + loc[0],
            latitude + loc[1]
        ])
    }

    return locs;
}

export const useSearchParkingPlacesAroundLoc = () => {
    const [parkingPlacesLoc, setParkingPlacesLoc] = useState<COORDINATES[]>([]);

    const searchParkingPlacesAroundLoc = (location: COORDINATES) => {
        const locs = getRandomLocsAroundLoc(location);

        setParkingPlacesLoc(locs);
    }

    return {
        parkingPlacesLoc,
        searchParkingPlacesAroundLoc
    }
}
