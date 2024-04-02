/* eslint-disable camelcase */
import { PosterContent } from './entities/PosterContent.entity'
import { PosterVisibilityEnum } from './entities/PosterVisibility.entity'

export enum CanvasSubRoutesEnum {
    LAYOUT = 'layout',
    AUTHORS = 'authors',
    INFO = 'info',
    CONTENT = 'content',
    PREVIEW = 'preview',
    DOWNLOAD = 'download',
}

export enum PDFLayout {
    MORRISON_LANDSCAPE = 'morrison_landscape',
    CLASSIC_LANDSCAPE = 'classic_landscape',
    SIMPLE_LANDSCAPE = 'simple_landscape',
    MORRISON_PORTRAIT = 'morrison_portrait',
    CLASSIC_PORTRAIT = 'classic_portrait',
    SIMPLE_PORTRAIT = 'simple_portrait',
}

export enum PDFType {
    SIMPLE = 'simple',
    CLASSIC = 'classic',
    MORRISON = 'morrison',
}

export type CanvasType = PDFType.CLASSIC | PDFType.MORRISON | PDFType.SIMPLE

export const layoutData: Record<CanvasType, { value: PDFLayout; label: string }[]> = {
    [PDFType.MORRISON]: [
        { value: PDFLayout.MORRISON_LANDSCAPE, label: 'Landscape' },
        { value: PDFLayout.MORRISON_PORTRAIT, label: 'Portrait' },
    ],

    [PDFType.CLASSIC]: [
        { value: PDFLayout.CLASSIC_LANDSCAPE, label: 'Landscape' },
        { value: PDFLayout.CLASSIC_PORTRAIT, label: 'Portrait' },
    ],
    [PDFType.SIMPLE]: [
        { value: PDFLayout.SIMPLE_LANDSCAPE, label: 'Landscape' },
        { value: PDFLayout.SIMPLE_PORTRAIT, label: 'Portrait' },
    ],
}

export interface Block
    extends Pick<PosterContent, 'name' | 'simpleText' | 'structuredText' | 'images'> {
    placeholder: string
}

export const posterVisibilityData = [
    {
        value: PosterVisibilityEnum.PUBLIC,
        label: 'Public (everyone can see it)',
    },
    {
        value: PosterVisibilityEnum.PRIVATE,
        label: 'Private (only you can see it)',
    },
]

// Follows the standard morrison color palette
export enum MorrisonColorPalette {
    THEORY = '#1a237e',
    EMPIRICAL = '#004d40',
    METHODS = '#8c1616',
    INVENTION = '#ffd54f',
}

export const morrisonTypeData: {
    value: MorrisonColorPalette
    label: string
}[] = [
    { value: MorrisonColorPalette.THEORY, label: 'Theory' },
    { value: MorrisonColorPalette.EMPIRICAL, label: 'Empirical' },
    { value: MorrisonColorPalette.METHODS, label: 'Methods' },
    { value: MorrisonColorPalette.INVENTION, label: 'Invention' },
]

export enum EventEmitterEnum {
    PDF_DOWNLOAD_EVENT = 'pdf_download_event',
    FILE_UPLOAD_EVENT = 'file_upload_event',
}

export enum MaxContentLength {
    MORRISON_LANDSCAPE_CONTENT_LENGTH = 220,
    MORRISON_PORTRAIT_CONTENT_LENGTH = 400,
    CLASSIC_LANDSCAPE_CONTENT_LENGTH = 450,
    CLASSIC_PORTRAIT_CONTENT_LENGTH = 450,
}
