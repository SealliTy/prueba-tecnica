import { useEffect, useState } from 'react'

export interface Dock {
    id: string
    name: string
    hasCrossDocking: boolean,
    lastSchedulingDate: string,
    description: string
}

export const useDocks = () => {
    const localDocks = localStorage.getItem('docks')
    const [docks, setDocks] = useState<Dock[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const getDocks = () => {
        fetch('https://w2nzwqcgv5.execute-api.us-east-2.amazonaws.com/technical-test/docks')
        .then(res => {
            return res.json()
        .then(data => {
            localStorage.setItem('docks', JSON.stringify(data.docks))
            setDocks(data.docks)
            setIsLoading(false)
        })
        }).catch(err => {
            setIsLoading(false)
            console.log('err', err);
        })
    }

    useEffect(() => {
        if(!localDocks) {
            getDocks()
        } else {
            console.log('123', JSON.parse(localDocks));
            setDocks(JSON.parse(localDocks))
            setIsLoading(false)
        }
    }, [localDocks])

    return { docks, setDocks, isLoading }
}