import { Topic } from './Topic.entity'
import { Keyword } from './Keyword.entity'
import { UploadResponse } from './Upload.entity'
export interface InformationTab {
    id: number
    description: string
    topics: Topic[]
    keywords: Keyword[]
    attachments: UploadResponse[]
}
