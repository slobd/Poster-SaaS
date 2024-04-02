import axios, { AxiosResponse } from 'axios'
import base64imageIcon from '../../assets/img/canvas/base64imageIcon'
import base64WhiteLogo from '../../assets/img/canvas/base64WhiteLogo'
import base64Logo from '../../assets/img/canvas/base64Logo'
import base64QrImage from '../../assets/img/canvas/base64QrImage'

export default function useCanvas() {
    const asyncFileReader = (file: File) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
                resolve(reader.result)
            }

            reader.onerror = reject

            reader.readAsDataURL(file)
        })

    const generateRandomString = () => {
        return Math.random().toString(36).substr(2, 5)
    }

    const getBase64ImageFromURL = async (url: string) => {
        try {
            const result: AxiosResponse<any> = await axios.get(url, {
                responseType: 'arraybuffer',
            })

            const contentType = result.headers['content-type']
            const base64 = btoa(
                new Uint8Array(result.data).reduce(
                    (data, byte) => data + String.fromCharCode(byte),
                    ''
                )
            )
            return `data:${contentType};base64,${base64}`
        } catch (error) {}
    }

    const getQR = () => base64QrImage

    const getLogo = () => base64Logo

    const getWhiteLogo = () => base64WhiteLogo

    const getImageIcon = () => base64imageIcon

    const stringToColor = (str: string) => {
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

    return {
        asyncFileReader,
        generateRandomString,
        getQR,
        getLogo,
        getWhiteLogo,
        getImageIcon,
        stringToColor,
        getBase64ImageFromURL,
    }
}
