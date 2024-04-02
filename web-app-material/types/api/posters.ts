import { AxiosResponse } from 'axios'
import { Poster } from '~/types/entities/Poster.entity'

export type findPosters = AxiosResponse<Poster[]>
