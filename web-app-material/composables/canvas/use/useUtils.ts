import axios, { AxiosResponse } from 'axios'
import base64imageIcon from './assets/base64imageIcon'
import base64WhiteLogo from './assets/base64WhiteLogo'
import base64Logo from './assets/base64Logo'
import base64QrImage from './assets/base64QrImage'

export const objectCopy = (arr: any[] | object) => JSON.parse(JSON.stringify(arr))

export const asyncFileReader = (file: File) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            resolve(reader.result)
        }

        reader.onerror = reject

        reader.readAsDataURL(file)
    })

export const generateRandomString = () => {
    return Math.random().toString(36).substr(2, 5)
}

export const removeEmptyKeyFromObject = (obj: Record<string, any>): Record<string, any> => {
    Object.keys(obj).forEach((key) => (obj[key] === '' || obj[key] == null) && delete obj[key])
    return obj
}

export const getBase64ImageFromURL = async (url: string) => {
    try {
        const result: AxiosResponse<any> = await axios.get(url, {
            responseType: 'arraybuffer',
        })

        const contentType = result.headers['content-type']
        const base64 = btoa(
            new Uint8Array(result.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
        )
        return `data:${contentType};base64,${base64}`
    } catch (error) {}
}

export const dataURItoBlob = (dataURI) => {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    const byteString = atob(dataURI.split(',')[1])

    // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    // write the bytes of the string to an ArrayBuffer
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
    }

    return new Blob([ab], { type: mimeString })
}

export const generateCanvasTitle = (title: string): string => {
    const date = new Date()
    const currentDate =
        date.getFullYear() +
        '-' +
        ('0' + (date.getMonth() + 1)).slice(-2) +
        '-' +
        ('0' + date.getDate()).slice(-2)
    return `${currentDate}_PosterLab_${title.slice(0, 15).split(' ').join('_')}`
}

export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

export function getServerUrl() {
    return typeof window !== 'undefined' ? window.location.origin : ''
}

export const getQR = () => base64QrImage

export const getLogo = () => base64Logo

export const getWhiteLogo = () => base64WhiteLogo

export const getImageIcon = () => base64imageIcon

export const stringToColour = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    let colour = '#'
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff
        colour += ('00' + value.toString(16)).substr(-2)
    }
    return colour
}
