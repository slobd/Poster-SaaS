/* eslint-disable camelcase */
import {
    TDocumentDefinitions,
    StyleDictionary,
    Content,
    CustomTableLayout,
    ContentTable,
    ContentImage,
    PageBreak,
} from 'pdfmake/interfaces'
import { PDFType, PDFLayout, Block, MorrisonColorPalette, MaxContentLength } from '~/types/canvas'
import { UploadResponse } from '~/types/entities/Upload.entity'
import { Author } from '~/types/entities/Author.entity'
import {
    capitalizeFirstLetter,
    getImageIcon,
    getLogo,
    getWhiteLogo,
} from '~/composables/canvas/use/useUtils'

export default function (payload: {
    title: string
    findingBlock: {
        name: string
        simpleText: string
        structuredText?: string
        placeholder: string
        image: UploadResponse
    }
    morrisonBgColor: MorrisonColorPalette
    layout: PDFLayout
    blocks: Block[]
    authors: Author[]
}): TDocumentDefinitions {
    const { title, blocks, authors, layout, findingBlock, morrisonBgColor } = payload
    const finding = findingBlock.simpleText

    const type: PDFType = layout.includes(PDFType.CLASSIC)
        ? PDFType.CLASSIC
        : layout.includes(PDFType.SIMPLE)
        ? PDFType.SIMPLE
        : PDFType.MORRISON

    let maxContentLength = 200

    switch (layout) {
        case PDFLayout.MORRISON_LANDSCAPE:
            maxContentLength = MaxContentLength.MORRISON_LANDSCAPE_CONTENT_LENGTH
            break

        case PDFLayout.MORRISON_PORTRAIT:
            maxContentLength = MaxContentLength.MORRISON_PORTRAIT_CONTENT_LENGTH
            break

        case PDFLayout.CLASSIC_LANDSCAPE:
        case PDFLayout.SIMPLE_LANDSCAPE:
            maxContentLength = MaxContentLength.CLASSIC_LANDSCAPE_CONTENT_LENGTH
            break

        case PDFLayout.CLASSIC_PORTRAIT:
        case PDFLayout.SIMPLE_PORTRAIT:
            maxContentLength = MaxContentLength.CLASSIC_PORTRAIT_CONTENT_LENGTH
            break

        default:
            maxContentLength = 200
            break
    }

    const simpleCheck = type === PDFType.SIMPLE
    const classicCheck = type === PDFType.CLASSIC
    const morrisonCheck = type === PDFType.MORRISON

    const classicOrSimpleCheck = simpleCheck || classicCheck

    const morrisonLandscapeCheck = layout === PDFLayout.MORRISON_LANDSCAPE
    const morrisonPortraitCheck = layout === PDFLayout.MORRISON_PORTRAIT
    const classicLandscapeCheck = layout === PDFLayout.CLASSIC_LANDSCAPE
    const classicPortraitCheck = layout === PDFLayout.CLASSIC_PORTRAIT
    const simpleLandscapeCheck = layout === PDFLayout.SIMPLE_LANDSCAPE
    const simplePortraitCheck = layout === PDFLayout.SIMPLE_PORTRAIT

    const classicOrSimpleLandscapeCheck = simpleLandscapeCheck || classicLandscapeCheck
    const classicOrSimplePortraitCheck = simplePortraitCheck || classicPortraitCheck

    const results = 'results'
    const logo = layout.includes(PDFType.MORRISON) ? getWhiteLogo() : getLogo()
    const getAuthorsWithInstitutions = (authors: { name: string; organization: string }[]) => {
        return authors.map(
            (item, i) =>
                (item?.name &&
                    item.name +
                        ' from ' +
                        item.organization +
                        (i < authors.length - 1 ? ', ' : '')) ||
                ''
        )
    }

    // Next TODO finish picture in column implementation

    // Convert long words present in text in chunks of index characters
    function spaceWord(text: string): string {
        const index = classicOrSimpleCheck ? 25 : 20

        return text
            .split(' ')
            .map((word) => {
                if (word.length > 25) {
                    let deductedWord = word.substring(0, index)
                    let restWord = word.substring(index)
                    let endWord = deductedWord
                    while (restWord.length > 25) {
                        restWord = restWord.substring(index)
                        deductedWord = restWord.substring(0, index)
                        endWord = `${endWord}- ${deductedWord}`
                    }
                    return endWord
                } else {
                    return word
                }
            })
            .join(' ')
    }

    const header = (currentPage: number): Content => {
        if (classicOrSimpleCheck) {
            if (currentPage === 1)
                // Show header only on first page
                return {
                    columns: [
                        {
                            width: '*',
                            text: spaceWord(title),
                            fontSize: classicOrSimplePortraitCheck ? 14 : 20,
                            noWrap: false,
                            bold: true,
                            color: 'gray',
                            margin: [0, 25, 15, 0],
                        },
                        {
                            stack: [
                                {
                                    text: getAuthorsWithInstitutions(authors),
                                    fontSize: 10,
                                },
                            ],
                            margin: [0, 25, 0, 5],
                            // width: 300,
                            width: classicOrSimpleLandscapeCheck ? 245 : 200,
                        },
                    ],
                    margin: [30, 0, 30, 0],
                }
        }
        if (morrisonCheck) {
            if (morrisonLandscapeCheck) return {} as Content
            return {
                table: {
                    widths: '*',
                    heights: 300,
                    body: [
                        [
                            {
                                text: spaceWord(finding),
                                fontSize: 40,
                                style: 'finding',
                            },
                        ],
                    ],
                },
                layout: {
                    defaultBorder: false,
                    fillColor: morrisonBgColor,
                },
            }
        }
        return {} as Content
    }

    const tableLayout: CustomTableLayout = {
        hLineWidth(i: number, node) {
            return i === 0 || i === node.table.body.length ? 1 : 2
        },
        vLineWidth(i: number, node: ContentTable) {
            const {
                table: { widths },
            } = node
            return i === 0 || (widths && i === widths.length) ? 1 : 2
        },
        hLineColor(i: number, node: ContentTable) {
            return i === 0 || i === node.table.body.length ? 'gray' : '#42E6DF'
        },
        vLineColor(i: number, node: ContentTable) {
            const {
                table: { widths },
            } = node
            return i === 0 || (widths && i === widths.length) ? 'gray' : '#42E6DF'
        },
        defaultBorder: classicOrSimpleCheck,
    }

    const footerContent = [
        {
            stack: [
                {
                    width: 40,
                    text: 'CREATED IN ONE CLICK BY',
                    color: classicOrSimpleCheck ? '#1C2268' : 'white',
                    fontSize: 6,
                    margin: classicOrSimpleCheck ? [0, 5, 5, 0] : [10, 50, 0, 0],
                },
                {
                    image: logo,
                    link: 'https://posterlab.co',
                    width: 80,
                    margin: classicOrSimpleCheck ? [0, 5, 0, 0] : [10, 5, 0, 0],
                },
            ],
            alignment: 'left',
        },
        {
            stack: [
                {
                    width: '*',
                    text: 'PosterLab.co',
                    link: 'https://posterlab.co',
                    color: classicOrSimpleCheck ? '#1C2268' : 'white',
                    fontSize: 12,
                    margin: classicOrSimpleCheck ? [0, 0, 5, 0] : [10, 45, 10, 0],
                },
                {
                    text: 'Knowledge transferred',
                    color: classicOrSimpleCheck ? '#1C2268' : 'white',
                    fontSize: 8,
                    margin: classicOrSimpleCheck ? [0, 5, 5, 0] : [0, 5, 10, 0],
                },
            ],
            alignment: 'right',
        },
    ]

    const footer = (currentPage, pageCount): Content => {
        if (morrisonLandscapeCheck) return {} as Content

        if (morrisonPortraitCheck)
            return {
                table: {
                    widths: ['*', '*'],
                    heights: 100,
                    body: [footerContent],
                },
                layout: {
                    defaultBorder: false,
                    fillColor: morrisonBgColor,
                },
                margin: [0, 0, 0, 0],
            }
        return {
            table: {
                widths: ['*', 100, '*'],
                heights: 100,
                body: [
                    [
                        footerContent[0],
                        {
                            text: currentPage + '/' + pageCount,
                            alignment: 'center',
                            margin: [0, 20, 0, 0],
                        },
                        footerContent[1],
                    ],
                ],
            },
            layout: {
                defaultBorder: false,
            },
            margin: [25, 0, 25, 0],
        }
    }

    const computedHeight = (): number => {
        let height = 210

        switch (type) {
            case PDFType.MORRISON:
                if (morrisonPortraitCheck) height = 150
                if (morrisonLandscapeCheck) height = 90
                break

            default:
                height = 210
                if (classicOrSimplePortraitCheck) {
                    height = 210
                }
                break
        }
        return height
    }

    const generateImage = (payload: { block: Block; index: number }) => {
        const {
            block: { name, images },
            index,
        } = payload
        let pageBreak: string = ''

        if (!name) return {}

        if (classicCheck) {
            // Ensure Page break to avoid unwanted surprises
            if (classicOrSimpleLandscapeCheck && index > 3) pageBreak = 'before'

            if (classicOrSimplePortraitCheck && index > 2) pageBreak = 'before'

            // Loop images and format them
            let imageArray: ContentImage[] | any = images.map((image) => {
                if (image && image.location && image.url) {
                    const fit = classicOrSimpleLandscapeCheck ? [145, 145] : [230, 230]
                    return {
                        image: image.url,
                        fit,
                        style: 'image',
                    }
                }

                return {
                    text: 'No image',
                    margin: 10,
                    style: 'noContent',
                }
            })

            // Default content when no images
            if (!images || (images && !images.length))
                imageArray = [
                    {
                        text: 'No images',
                        margin: 10,
                        style: 'noContent',
                    },
                ]

            return {
                margin: [0, -50, 15, 0], // occupy space taken by the header
                pageBreak,
                table: {
                    heights: classicOrSimpleLandscapeCheck ? 500 : 750, // Force table to fit content
                    widths: ['*'],
                    body: [
                        [
                            {
                                stack: [
                                    {
                                        text: `${index || ''}. ${capitalizeFirstLetter(name)}`,
                                        style: 'subheader',
                                    },
                                    ...imageArray,
                                ],
                            },
                        ],
                    ],
                },
                layout: 'noBorders',
            }
        }
    }

    const generateColumn = (payload: {
        block: Block
        index: number
        last?: boolean
    }): ContentTable => {
        const {
            block: { simpleText, name, images },
            index,
            last,
        } = payload

        const imageSignaler =
            classicCheck && images?.length
                ? {
                      image: getImageIcon(),
                      width: 15,
                      margin: [215, -18, 0, 10],
                      fillColor: 'gray',
                      background: 'gray',
                  }
                : morrisonLandscapeCheck && images?.length && name.toLowerCase() === results
                ? {
                      image: images[0].url,
                      fit: [100, 100],
                      margin: [0, 10, 0, 10],
                  }
                : {}

        const text = morrisonCheck
            ? name
            : !name
            ? ''
            : `${index || ''}. ${capitalizeFirstLetter(name)}`

        return {
            margin: morrisonCheck ? [0, 0, -15, -10] : index <= 3 ? [0, 0, 15, 15] : [0, 0, 15, 0],
            layout: (name && tableLayout) || 'noBorders',
            pageBreak: (last && classicCheck && 'after') || ('' as PageBreak),
            table: {
                heights: computedHeight(),
                widths: ['*'],
                body: [
                    [
                        {
                            stack: [
                                {
                                    // Title
                                    text,
                                    style: 'subheader',
                                },
                                imageSignaler,
                                {
                                    margin: classicOrSimpleCheck ? 10 : [0, 5, 15, 5],
                                    alignment: morrisonCheck ? 'left' : 'justify',
                                    text: spaceWord(simpleText.slice(0, maxContentLength)),
                                    style: 'content',
                                },
                            ],
                        },
                    ],
                ],
            },
        }
    }

    const generateColumnWithImage = (payload: { block: Block; index: number }): ContentTable => {
        const {
            block: { simpleText, name, images },
            index,
        } = payload

        // Loop images and format them
        const imageArray: ContentImage[] | any = images.map((image) => {
            if (image?.location && image?.url) {
                const fit = classicOrSimpleLandscapeCheck ? [145, 145] : [230, 230]
                return {
                    image: image.url,
                    fit,
                    style: 'image',
                }
            }

            return null
        })

        const text = !name ? '' : `${index || ''}. ${capitalizeFirstLetter(name)}`

        return {
            margin: index <= 3 ? [0, 0, 15, 15] : [0, 0, 15, 0],
            layout: (name && tableLayout) || 'noBorders',
            table: {
                heights: computedHeight(),
                dontBreakRows: true,
                headerRows: 1,
                widths: ['*'],
                body: [
                    [
                        {
                            stack: [
                                {
                                    // Title
                                    text,
                                    style: 'subheader',
                                },
                                {
                                    margin: 10,
                                    alignment: 'justify',
                                    text: spaceWord(simpleText.slice(0, maxContentLength)),
                                    style: 'content',
                                },
                                ...imageArray,
                            ],
                        },
                    ],
                ],
            },
        }
    }

    const generateMorrisonImageContent = (newBlocks: Block[]) => {
        let imageCounter = 0 // Make sure no more than 3 images on morrison
        return [
            {
                stack: newBlocks.map(({ images, name }) => {
                    const image = (images?.length && images[0]?.url) || null
                    if (image) {
                        if (name.toLowerCase() !== results && morrisonLandscapeCheck) {
                            imageCounter++ // only increment when name is not "results" and morrison landscape
                        }

                        if (
                            imageCounter > 3 ||
                            (name.toLowerCase() === results && morrisonLandscapeCheck) // Remove "results" images from the list
                        )
                            return {
                                text: '',
                            }

                        return {
                            image,
                            fit: morrisonPortraitCheck ? [90, 90] : [100, 100],
                            style: 'morrisonImage',
                        }
                    }
                    return {
                        text: '',
                    }
                }),
                margin: [0, -35, 0, 0],
            },
        ]
    }

    const mainContentGenerator = (type: string) => {
        let step = 3 // content grid size

        if (classicOrSimplePortraitCheck || morrisonPortraitCheck) step = 2

        if (morrisonLandscapeCheck) step = 1

        const newBlocks: Block[] = [...blocks]

        // Make sure block are even
        while (newBlocks.length % step !== 0) {
            newBlocks.push({
                name: '',
                images: [],
                placeholder: '',
                simpleText: '',
                structuredText: '',
            })
        }

        // Generate only content
        if (type === 'content') {
            const contentArray = newBlocks.map((block, index) =>
                generateColumn({
                    block,
                    last: index === newBlocks.length - 2,
                    index: index + 1,
                })
            )

            return [
                contentArray.slice(0, step),
                contentArray.slice(step, step * 2),
                // MORRISON_LANDSCAPE
                morrisonLandscapeCheck && contentArray.slice(step * 2, step * 3),
                morrisonLandscapeCheck && contentArray.slice(step * 3, step * 4),
                // Classic Portrait
                classicOrSimplePortraitCheck && contentArray.slice(step * 2, step * 3),
            ].filter((item) => item && item.length)
        }

        // Generate content including image
        if (type === 'imageWithContent') {
            const contentArray = newBlocks.map((block, index) =>
                generateColumnWithImage({
                    block,
                    index: index + 1,
                })
            )

            return [
                contentArray.slice(0, step),
                contentArray.slice(step, step * 2),
                // MORRISON_LANDSCAPE
                morrisonLandscapeCheck && contentArray.slice(step * 2, step * 3),
                morrisonLandscapeCheck && contentArray.slice(step * 3, step * 4),
                // Classic/Simple Portrait
                classicOrSimplePortraitCheck && contentArray.slice(step * 2, step * 3),
            ].filter((item) => item && item.length)
        }

        if (morrisonCheck) {
            return generateMorrisonImageContent(newBlocks)
        }

        const contentArray = newBlocks.map((block, index) =>
            generateImage({ block, index: index + 1 })
        )

        return [
            contentArray.slice(0, step),
            contentArray.slice(step, step * 2),
            classicOrSimplePortraitCheck && contentArray.slice(step * 2, step * 3),
        ].filter((item) => item && item.length)
    }

    const generateContent = () => mainContentGenerator('content')
    const generateImageContent = () => mainContentGenerator('image')
    const generateImageWithContent = () => mainContentGenerator('imageWithContent')

    const morrisonLandscapeContent = [
        {
            layout: tableLayout,
            table: {
                widths: ['*'],
                body: generateContent(),
            },
        },
        {
            margin: [0, -8, 0, 0],
            table: {
                widths: '*',
                heights: 600,
                body: [
                    [
                        {
                            stack: [
                                {
                                    layout: 'noBorders',
                                    table: {
                                        heights: 200,
                                        body: [
                                            [
                                                {
                                                    text: spaceWord(finding),
                                                    style: 'finding',
                                                },
                                            ],
                                        ],
                                    },
                                },
                                {
                                    layout: 'noBorders',
                                    table: {
                                        heights: 280,
                                        body: [
                                            [
                                                (findingBlock.image.url && {
                                                    image: findingBlock.image.url,
                                                    fit: [280, 280],
                                                    margin: [25, 0, 0, 0],
                                                }) || {
                                                    text: '',
                                                },
                                            ],
                                        ],
                                    },
                                },
                                {
                                    table: {
                                        widths: ['*', '*'],
                                        heights: 100,
                                        body: [footerContent],
                                    },
                                    layout: {
                                        defaultBorder: false,
                                        fillColor: morrisonBgColor,
                                    },
                                    margin: [0, 0, 0, 0],
                                },
                            ],
                        },
                    ],
                ],
            },
            layout: {
                defaultBorder: false,
                fillColor: morrisonBgColor,
            },
        },
        {
            columns: [
                {
                    stack: [
                        {
                            stack: [
                                {
                                    text: spaceWord(title),
                                    margin: [5, 5, 10, 10],
                                    style: 'findingTitle',
                                },
                                {
                                    text: getAuthorsWithInstitutions(authors),
                                    margin: [5, 0, 0, 0],
                                    color: 'gray',
                                    fontSize: 10,
                                },
                            ],
                            alignment: 'left',
                        },
                        {
                            text: 'Extra Tables & Figures',
                            fontSize: 15,
                            bold: true,
                            margin: [5, 15, 10, 40],
                        },
                        ...generateImageContent(),
                    ],
                },
            ],
        },
    ]

    const morrisonPortraitContent = [
        {
            columns: [
                {
                    stack: [
                        {
                            text: spaceWord(title),
                            margin: [10, 10, 0, 0],
                            style: 'findingTitle',
                        },
                        {
                            text: getAuthorsWithInstitutions(authors),
                            color: 'gray',
                            margin: [10, 0, 0, 0],
                            fontSize: 10,
                        },
                        {
                            layout: tableLayout,
                            table: {
                                widths: ['*', '*'],
                                body: generateContent(),
                            },
                        },
                    ],
                    alignment: 'left',
                },
            ],
        },

        {
            margin: [0, 0, 0, 0],
            canvas: [
                {
                    type: 'line',
                    x1: 0,
                    y1: -2,
                    x2: 0,
                    y2: 433.89,
                    lineWidth: 1,
                    lineColor: morrisonBgColor,
                },
            ],
        },
        {
            columns: [
                {
                    stack: [
                        {
                            text: 'Extra Tables & Figures',
                            fontSize: 14,
                            bold: true,
                            margin: [0, 10, 10, 30],
                        },
                        ...generateImageContent(),
                    ],
                },
            ],
        },
    ]

    const Styles = (): StyleDictionary => {
        return {
            subheader: {
                fontSize: morrisonCheck ? 12 : 16,
                bold: true,
                margin: morrisonCheck ? [0, 5, 10, 0] : [10, 10, 10, 0],
            },
            content: {
                fontSize: 10,
            },
            noContent: {
                fontSize: 12,
                color: 'gray',
            },
            // Style images
            image: {
                alignment: 'left',
                margin: [15, 5, 0, 5],
            },
            morrisonImage: {
                alignment: 'left',
                margin: [0, 5, 0, 5],
            },
            finding: {
                fontSize: 30,
                bold: true,
                color: 'white',
                margin: 25,
            },
            findingTitle: {
                fontSize: 18,
                bold: true,
            },
        }
    }

    const Layout = () => {
        if (morrisonPortraitCheck)
            return [
                {
                    layout: 'noBorders',
                    table: {
                        widths: ['*', 5, 150],
                        body: [['', '', ''], morrisonPortraitContent],
                    },
                },
            ]

        if (morrisonLandscapeCheck)
            return [
                {
                    layout: 'noBorders',
                    table: {
                        widths: [175, '*', 175],
                        body: [['', '', ''], morrisonLandscapeContent],
                    },
                },
            ]

        // default to classic
        return [
            {
                layout: 'noBorders',
                table: {
                    widths: ['*'],
                    body: [
                        [''],
                        [
                            [
                                {
                                    layout: 'noBorders',
                                    margin: [0, 0, -15, 0],
                                    table: {
                                        widths: classicOrSimpleLandscapeCheck
                                            ? ['*', '*', '*']
                                            : ['*', '*'],
                                        body: classicCheck
                                            ? [
                                                  // ...generateContent(),
                                                  // ...generateImageContent(),
                                                  ...generateImageWithContent(),
                                              ]
                                            : [...generateContent()],
                                    },
                                },
                            ],
                        ],
                    ],
                },
            },
        ]
    }

    const documentDefinitions = (): TDocumentDefinitions => {
        const PDFDefinition: TDocumentDefinitions = {
            pageSize: 'A4',
            pageOrientation: (layout.includes('landscape') && 'landscape') || 'portrait',
            pageMargins: [30, 80, 30, 50],
            header: (currentPage: number) => header(currentPage),
            footer: (currentPage, pageCount) => footer(currentPage, pageCount),
            content: Layout(),
            styles: Styles(),
            defaultStyle: {
                columnGap: 15,
            },
        }
        if (classicOrSimpleCheck) return PDFDefinition

        PDFDefinition.pageMargins = morrisonPortraitCheck ? [10, 300, 10, 100] : [10, 0, 10, 0]

        return PDFDefinition
    }

    return documentDefinitions()
}
